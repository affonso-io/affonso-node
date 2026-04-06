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

const AFFILIATE_FIXTURE = {
	id: "aff_1",
	name: "Max",
	email: "max@test.de",
	tracking_id: "max-test",
	source: "api",
	partnership_status: "APPROVED",
	onboarding_completed: true,
	program_id: "prog_1",
	group_id: null,
	external_user_id: null,
	metadata: null,
	created_at: "2025-01-01T00:00:00.000Z",
};

describe("Affiliates", () => {
	it("list returns OffsetPage with spec-shaped data", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/affiliates");
			return {
				status: 200,
				body: {
					success: true,
					data: [AFFILIATE_FIXTURE],
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

		const page = await client.affiliates.list({ limit: 10 });
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].id).toBe("aff_1");
		expect(page.data[0].source).toBe("api");
		expect(page.data[0].partnership_status).toBe("APPROVED");
		expect(page.data[0].tracking_id).toBe("max-test");
	});

	it("list passes query params including expand as string", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("partnership_status=pending");
			expect(url).toContain("expand=promoCodes%2CcommissionOverrides");
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

		await client.affiliates.list({
			partnership_status: "pending",
			expand: "promoCodes,commissionOverrides",
		});
	});

	it("retrieve returns affiliate with expand", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/affiliates/aff_1");
			expect(url).toContain("expand=promoCodes");
			return {
				status: 200,
				body: {
					success: true,
					data: {
						...AFFILIATE_FIXTURE,
						promoCodes: [
							{
								code: "SAVE10",
								promo_code_id: null,
								coupon_id: null,
								discount_type: "percentage",
								discount_value: 10,
								duration: "forever",
								created_at: "2025-01-01T00:00:00.000Z",
							},
						],
					},
				},
			};
		});

		const aff = await client.affiliates.retrieve("aff_1", { expand: "promoCodes" });
		expect(aff.promoCodes).toHaveLength(1);
		expect(aff.promoCodes?.[0].code).toBe("SAVE10");
	});

	it("create sends POST with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("Max");
			expect(body.email).toBe("max@test.de");
			expect(body.program_id).toBe("prog_1");
			expect(body.payout_method).toBe("paypal");
			expect(body.payout_details).toEqual({ email: "max@paypal.de" });
			return {
				status: 201,
				body: { success: true, data: AFFILIATE_FIXTURE },
			};
		});

		const aff = await client.affiliates.create({
			name: "Max",
			email: "max@test.de",
			program_id: "prog_1",
			payout_method: "paypal",
			payout_details: { email: "max@paypal.de" },
		});
		expect(aff.id).toBe("aff_1");
	});

	it("update sends PUT with status field (not partnership_status)", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PUT");
			const body = JSON.parse(init.body as string);
			expect(body.status).toBe("approved");
			expect(body.name).toBe("Max M.");
			return {
				status: 200,
				body: { success: true, data: { ...AFFILIATE_FIXTURE, name: "Max M." } },
			};
		});

		const aff = await client.affiliates.update("aff_1", { name: "Max M.", status: "approved" });
		expect(aff.name).toBe("Max M.");
	});

	it("del sends DELETE and returns success message", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Affiliate deleted" },
			};
		});

		const result = await client.affiliates.del("aff_1");
		expect(result.success).toBe(true);
		expect(result.message).toBe("Affiliate deleted");
	});
});
