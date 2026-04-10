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
	paid_ads: false,
	content_marketing: true,
	coupon_sites: false,
	review_sites: true,
	incentivized_traffic: false,
	trademark_bidding: false,
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
		expect(restrictions.paid_ads).toBe(false);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.paid_ads).toBe(true);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...RESTRICTIONS_FIXTURE, paid_ads: true },
				},
			};
		});

		const restrictions = await client.program.restrictions.update({ paid_ads: true });
		expect(restrictions.paid_ads).toBe(true);
	});
});
