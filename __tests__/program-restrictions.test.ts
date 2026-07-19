import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

function createMockClient(
	handler: (url: string, init: RequestInit) => { status: number; body: unknown },
) {
	const fetchFn = vi.fn(async (url: string, init: RequestInit) => {
		const result = handler(url, init);
		return {
			ok: result.status >= 200 && result.status < 300,
			status: result.status,
			headers: new Headers(),
			json: async () => result.body,
		} as Response;
	});

	return new Affonso("sk_test_123", {
		baseUrl: "https://api.test.io/v1",
		fetch: fetchFn,
		maxRetries: 0,
	});
}

const RESTRICTIONS_FIXTURE = {
	websites: true,
	social_marketing: true,
	organic_social: false,
	email_marketing: true,
	mobile_traffic: false,
	search_engine_marketing: true,
	organic_search: true,
	rebrokering: false,
	incent: false,
	brand_bidding: false,
	additional_restrictions: null,
};

describe("Program Restrictions", () => {
	it("retrieve returns restrictions", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/restrictions");
			return {
				status: 200,
				body: { success: true, data: RESTRICTIONS_FIXTURE },
			};
		});

		const restrictions = await client.program.restrictions.retrieve();
		expect(restrictions.websites).toBe(true);
		expect(restrictions.mobile_traffic).toBe(false);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.mobile_traffic).toBe(true);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...RESTRICTIONS_FIXTURE, mobile_traffic: true },
				},
			};
		});

		const restrictions = await client.program.restrictions.update({ mobile_traffic: true });
		expect(restrictions.mobile_traffic).toBe(true);
	});
});
