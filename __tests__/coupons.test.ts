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

const COUPON_FIXTURE = {
	id: "coup_1",
	affiliate_id: "aff_1",
	program_id: "prog_1",
	code: "SAVE10",
	discount_type: "percentage",
	discount_value: 10,
	duration: "forever",
	duration_in_months: null,
	product_ids: [],
	provider: "stripe",
	provider_coupon_id: "coupon_abc",
	provider_promo_code_id: "promo_abc",
	created_at: "2025-01-01T00:00:00.000Z",
	updated_at: null,
};

describe("Coupons", () => {
	it("list returns OffsetPage with full coupon shape", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: {
				success: true,
				data: [COUPON_FIXTURE],
				pagination: {
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
					has_next_page: false,
					has_prev_page: false,
				},
			},
		}));

		const page = await client.coupons.list();
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].provider).toBe("stripe");
		expect(page.data[0].provider_coupon_id).toBe("coupon_abc");
		expect(page.data[0].duration_in_months).toBeNull();
	});

	it("create sends correct body with provider-specific fields", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.affiliate_id).toBe("aff_1");
			expect(body.code).toBe("SAVE20");
			expect(body.discount_type).toBe("percentage");
			expect(body.discount_value).toBe(20);
			expect(body.duration).toBe("repeating");
			expect(body.duration_in_months).toBe(3);
			return {
				status: 201,
				body: {
					success: true,
					data: { ...COUPON_FIXTURE, code: "SAVE20", duration: "repeating", duration_in_months: 3 },
				},
			};
		});

		await client.coupons.create({
			affiliate_id: "aff_1",
			code: "SAVE20",
			discount_type: "percentage",
			discount_value: 20,
			duration: "repeating",
			duration_in_months: 3,
		});
	});

	it("no update method exists (per OpenAPI spec)", () => {
		const client = createMockClient(() => ({ status: 200, body: {} }));
		// @ts-expect-error — update should not exist on Coupons
		expect(client.coupons.update).toBeUndefined();
	});

	it("del returns success message (200)", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Coupon deleted" },
			};
		});

		const result = await client.coupons.del("coup_1");
		expect(result.success).toBe(true);
	});
});
