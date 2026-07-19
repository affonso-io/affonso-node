import { AffonsoError, ConnectionError, errorFromResponse } from "./errors.js";
import type { RequestOptions } from "./types.js";

declare const __SDK_VERSION__: string;
const VERSION = typeof __SDK_VERSION__ !== "undefined" ? __SDK_VERSION__ : "0.1.0";

export interface HttpClientConfig {
	apiKey: string;
	signingSecret?: string;
	baseUrl: string;
	timeout: number;
	maxRetries: number;
	fetch: typeof globalThis.fetch;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createRequestSignature(
	secret: string,
	timestamp: string,
	rawBody: string,
): Promise<string> {
	const key = await globalThis.crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await globalThis.crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(`${timestamp}.${rawBody}`),
	);
	return bytesToHex(new Uint8Array(signature));
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
		const serializedBody = opts.body === undefined ? undefined : JSON.stringify(opts.body);

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...opts.headers,
			Authorization: `Bearer ${this.config.apiKey}`,
		};

		if (isNode()) {
			headers["User-Agent"] = `affonso-sdk/${VERSION}`;
		}

		if (opts.signed && this.config.signingSecret && serializedBody !== undefined) {
			const timestamp = Math.floor(Date.now() / 1000).toString();
			headers["X-Affonso-Timestamp"] = timestamp;
			headers["X-Affonso-Signature"] = await createRequestSignature(
				this.config.signingSecret,
				timestamp,
				serializedBody,
			);
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
					body: serializedBody,
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
