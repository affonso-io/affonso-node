import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../src/errors.js";
import { HttpClient } from "../src/http.js";

function mockFetch(
	responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>,
) {
	let callIndex = 0;
	const calls: { url: string; init: RequestInit }[] = [];

	const fn = vi.fn(async (url: string, init: RequestInit) => {
		calls.push({ url, init });
		const resp = responses[callIndex++] ?? responses[responses.length - 1];
		return {
			ok: resp.status >= 200 && resp.status < 300,
			status: resp.status,
			headers: new Headers(resp.headers ?? {}),
			json: async () => resp.body,
		} as Response;
	});

	return { fn, calls };
}

function createClient(fetchFn: typeof fetch, opts?: { maxRetries?: number; timeout?: number }) {
	return new HttpClient({
		apiKey: "sk_test_123",
		baseUrl: "https://api.affonso.io/v1",
		timeout: opts?.timeout ?? 30_000,
		maxRetries: opts?.maxRetries ?? 0,
		fetch: fetchFn,
	});
}

describe("HttpClient", () => {
	it("sends Authorization header", async () => {
		const { fn, calls } = mockFetch([{ status: 200, body: { success: true, data: { id: "1" } } }]);
		const client = createClient(fn);
		await client.request({ method: "GET", path: "/test" });

		expect(calls[0].init.headers).toHaveProperty("Authorization", "Bearer sk_test_123");
	});

	it("serializes query params", async () => {
		const { fn, calls } = mockFetch([{ status: 200, body: { success: true, data: [] } }]);
		const client = createClient(fn);
		await client.request({ method: "GET", path: "/test", query: { page: 1, limit: 50 } });

		expect(calls[0].url).toBe("https://api.affonso.io/v1/test?page=1&limit=50");
	});

	it("serializes array query params", async () => {
		const { fn, calls } = mockFetch([{ status: 200, body: { success: true, data: [] } }]);
		const client = createClient(fn);
		await client.request({ method: "GET", path: "/test", query: { expand: ["a", "b"] } });

		expect(calls[0].url).toBe("https://api.affonso.io/v1/test?expand=a&expand=b");
	});

	it("sends JSON body for POST", async () => {
		const { fn, calls } = mockFetch([{ status: 201, body: { success: true, data: { id: "1" } } }]);
		const client = createClient(fn);
		await client.request({ method: "POST", path: "/test", body: { name: "Max" } });

		expect(calls[0].init.method).toBe("POST");
		expect(calls[0].init.body).toBe('{"name":"Max"}');
	});

	it("returns undefined for 204 No Content", async () => {
		const { fn } = mockFetch([{ status: 204, body: null }]);
		const client = createClient(fn);
		const result = await client.request({ method: "DELETE", path: "/test/1" });

		expect(result).toBeUndefined();
	});

	it("unwraps success envelope automatically", async () => {
		const { fn } = mockFetch([
			{ status: 200, body: { success: true, data: { id: "1", name: "Max" } } },
		]);
		const client = createClient(fn);
		const result = await client.request<{ success: true; data: { id: string } }>({
			method: "GET",
			path: "/test",
		});

		expect(result).toHaveProperty("success", true);
		expect(result).toHaveProperty("data");
	});

	it("throws typed error on failure response", async () => {
		const { fn } = mockFetch([
			{
				status: 404,
				body: { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
			},
		]);
		const client = createClient(fn);

		await expect(client.request({ method: "GET", path: "/test/1" })).rejects.toThrow(NotFoundError);
	});

	it("retries on 429", async () => {
		const { fn } = mockFetch([
			{
				status: 429,
				body: { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "slow" } },
			},
			{ status: 200, body: { success: true, data: { id: "1" } } },
		]);
		const client = createClient(fn, { maxRetries: 1 });
		const result = await client.request<{ data: { id: string } }>({ method: "GET", path: "/test" });

		expect(result.data.id).toBe("1");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("retries on 500", async () => {
		const { fn } = mockFetch([
			{
				status: 500,
				body: { success: false, error: { message: "server error" } },
			},
			{ status: 200, body: { success: true, data: { id: "1" } } },
		]);
		const client = createClient(fn, { maxRetries: 1 });
		const result = await client.request<{ data: { id: string } }>({ method: "GET", path: "/test" });

		expect(result.data.id).toBe("1");
	});

	it("throws after exhausting retries", async () => {
		const { fn } = mockFetch([
			{
				status: 500,
				body: { success: false, error: { message: "server error" } },
			},
		]);
		const client = createClient(fn, { maxRetries: 1 });

		await expect(client.request({ method: "GET", path: "/test" })).rejects.toThrow("server error");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("skips null/undefined query params", async () => {
		const { fn, calls } = mockFetch([{ status: 200, body: { success: true, data: [] } }]);
		const client = createClient(fn);
		await client.request({
			method: "GET",
			path: "/test",
			query: { page: 1, search: undefined, status: null },
		});

		expect(calls[0].url).toBe("https://api.affonso.io/v1/test?page=1");
	});
});
