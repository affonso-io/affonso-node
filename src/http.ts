import { AffonsoError, ConnectionError, errorFromResponse } from "./errors.js";
import type { RequestOptions } from "./types.js";

declare const __SDK_VERSION__: string;
const VERSION = typeof __SDK_VERSION__ !== "undefined" ? __SDK_VERSION__ : "0.1.0";

export interface HttpClientConfig {
	apiKey: string;
	baseUrl: string;
	timeout: number;
	maxRetries: number;
	fetch: typeof globalThis.fetch;
}

function buildQueryString(params: Record<string, unknown>): string {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue;
		if (Array.isArray(value)) {
			for (const v of value) {
				parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
			}
		} else {
			parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
		}
	}
	return parts.length > 0 ? `?${parts.join("&")}` : "";
}

function isRetryable(status: number): boolean {
	return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNode(): boolean {
	return (
		typeof process !== "undefined" && process.versions != null && process.versions.node != null
	);
}

export class HttpClient {
	private readonly config: HttpClientConfig;

	constructor(config: HttpClientConfig) {
		this.config = config;
	}

	async request<T>(opts: RequestOptions): Promise<T> {
		const url = `${this.config.baseUrl}${opts.path}${opts.query ? buildQueryString(opts.query) : ""}`;

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.config.apiKey}`,
			"Content-Type": "application/json",
		};

		if (isNode()) {
			headers["User-Agent"] = `affonso-sdk/${VERSION}`;
		}

		let lastError: AffonsoError | undefined;

		for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(new Error("Request timed out")),
				this.config.timeout,
			);

			try {
				const response = await this.config.fetch(url, {
					method: opts.method,
					headers,
					body: opts.body ? JSON.stringify(opts.body) : undefined,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (response.status === 204) {
					return undefined as unknown as T;
				}

				let body: { success?: boolean; error?: Record<string, unknown> };
				try {
					body = await response.json();
				} catch {
					throw new AffonsoError(
						`Expected JSON response but received unparseable body (status ${response.status})`,
						{ status: response.status, headers: response.headers },
					);
				}

				if (!response.ok || body.success === false) {
					const error = errorFromResponse(response.status, body, response.headers);

					if (isRetryable(response.status) && attempt < this.config.maxRetries) {
						lastError = error;
						const waitMs = this.getRetryDelay(attempt, response.headers);
						await sleep(waitMs);
						continue;
					}

					throw error;
				}

				return body as T;
			} catch (err) {
				clearTimeout(timeoutId);

				if (err instanceof Error && err.name === "AbortError") {
					const connErr = new ConnectionError("Request timed out");
					if (attempt < this.config.maxRetries) {
						lastError = connErr;
						await sleep(this.getRetryDelay(attempt));
						continue;
					}
					throw connErr;
				}

				if (err instanceof AffonsoError) {
					throw err;
				}

				if (err instanceof Error) {
					const connErr = new ConnectionError(err.message);
					if (attempt < this.config.maxRetries) {
						lastError = connErr;
						await sleep(this.getRetryDelay(attempt));
						continue;
					}
					throw connErr;
				}

				throw err;
			}
		}

		throw lastError ?? new ConnectionError("Request failed after retries");
	}

	private getRetryDelay(attempt: number, headers?: Headers): number {
		if (headers) {
			const reset = headers.get("x-ratelimit-reset");
			if (reset) {
				const resetMs = Number(reset) * 1000 - Date.now();
				if (resetMs > 0 && resetMs < 60_000) return resetMs;
			}
		}
		return Math.min(1000 * 2 ** attempt, 10_000);
	}
}
