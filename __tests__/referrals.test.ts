import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";
import { CursorPage } from "../src/pagination.js";

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

const REFERRAL_FIXTURE = {
	id: "ref_1",
	affiliate_id: "aff_1",
	program_id: "prog_1",
	email: "customer@test.de",
	customer_id: null,
	subscription_id: null,
	status: "lead",
	name: null,
	metadata: null,
	created_at: "2025-01-01T00:00:00.000Z",
	converted_at: null,
};

describe("Referrals", () => {
	it("list returns CursorPage with spec-shaped data", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: {
				success: true,
				data: [REFERRAL_FIXTURE],
				has_more: false,
			},
		}));

		const page = await client.referrals.list();
		expect(page).toBeInstanceOf(CursorPage);
		expect(page.data[0].affiliate_id).toBe("aff_1");
		expect(page.data[0].program_id).toBe("prog_1");
		expect(page.data[0].converted_at).toBeNull();
	});

	it("list passes cursor and filter params", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("starting_after=ref_0");
			expect(url).toContain("status=customer");
			expect(url).toContain("expand=affiliate");
			return {
				status: 200,
				body: { success: true, data: [], has_more: false },
			};
		});

		await client.referrals.list({
			starting_after: "ref_0",
			status: "customer",
			expand: "affiliate",
		});
	});

	it("retrieve with include=stats", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("include=stats");
			return {
				status: 200,
				body: {
					success: true,
					data: {
						...REFERRAL_FIXTURE,
						stats: {
							total_revenue: 100,
							total_commission: 10,
							total_orders: 1,
							last_order_at: "2025-01-01T00:00:00.000Z",
						},
					},
				},
			};
		});

		const ref = await client.referrals.retrieve("ref_1", { include: "stats" });
		expect(ref.stats?.total_revenue).toBe(100);
	});

	it("create sends POST without affiliate_id in update", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.email).toBe("new@test.de");
			expect(body.affiliate_id).toBe("aff_1");
			expect(body.click_id).toBe("click_1");
			return {
				status: 201,
				body: { success: true, data: REFERRAL_FIXTURE },
			};
		});

		await client.referrals.create({
			email: "new@test.de",
			affiliate_id: "aff_1",
			click_id: "click_1",
		});
	});

	it("update sends PUT (no affiliate_id in update params per schema)", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PUT");
			const body = JSON.parse(init.body as string);
			expect(body.status).toBe("customer");
			expect(body.customer_id).toBe("cus_123");
			expect(body.affiliate_id).toBeUndefined();
			return {
				status: 200,
				body: { success: true, data: { ...REFERRAL_FIXTURE, status: "customer" } },
			};
		});

		await client.referrals.update("ref_1", { status: "customer", customer_id: "cus_123" });
	});

	it("del returns success message (200, not 204)", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Referral deleted" },
			};
		});

		const result = await client.referrals.del("ref_1");
		expect(result.success).toBe(true);
	});
});
