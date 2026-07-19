import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";
import { OffsetPage } from "../src/pagination.js";

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

const MARKETPLACE_PROGRAM_FIXTURE = {
	id: "mp_1",
	name: "Cool SaaS",
	tagline: "The best tool",
	category: "saas",
	description: "A great program",
	website_url: "https://coolsaas.com",
	logo_url: null,
	access_mode: "public",
	currency: "USD",
	commission: {
		type: "COMMISSION",
		value: 25,
		is_percentage: true,
		apply_to: "ALL_PLANS",
		has_multiple_tiers: false,
	},
	terms: {
		cookie_lifetime_days: 30,
		payment_frequency: "monthly",
		payment_threshold: 50,
	},
};

describe("Marketplace", () => {
	it("list returns OffsetPage of programs", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/marketplace");
			return {
				status: 200,
				body: {
					success: true,
					data: [MARKETPLACE_PROGRAM_FIXTURE],
					pagination: {
						page: 1,
						limit: 10,
						total: 1,
						total_pages: 1,
						has_next_page: false,
						has_prev_page: false,
					},
				},
			};
		});

		const page = await client.marketplace.list();
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].name).toBe("Cool SaaS");
		expect(page.data[0].commission?.value).toBe(25);
		expect(page.data[0].terms?.cookie_lifetime_days).toBe(30);
	});

	it("list passes query params", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("category=saas");
			return {
				status: 200,
				body: {
					success: true,
					data: [],
					pagination: {
						page: 1,
						limit: 10,
						total: 0,
						total_pages: 0,
						has_next_page: false,
						has_prev_page: false,
					},
				},
			};
		});

		await client.marketplace.list({ category: "saas" });
	});

	it("retrieve returns single program", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/marketplace/mp_1");
			return {
				status: 200,
				body: { success: true, data: MARKETPLACE_PROGRAM_FIXTURE },
			};
		});

		const program = await client.marketplace.retrieve("mp_1");
		expect(program.id).toBe("mp_1");
		expect(program.website_url).toBe("https://coolsaas.com");
	});
});
