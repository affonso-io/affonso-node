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

const COMMISSION_FIXTURE = {
	id: "com_1",
	referral_id: "ref_1",
	affiliate_id: "aff_1",
	program_id: "prog_1",
	sale_amount: 99.0,
	sale_amount_currency: "USD",
	commission_amount: 9.9,
	commission_currency: "USD",
	status: "pending",
	sales_status: "complete",
	hold_period_days: null,
	payment_intent_id: null,
	invoice_id: null,
	created_at: "2025-01-01T00:00:00.000Z",
	updated_at: "2025-01-01T00:00:00.000Z",
	earning_id: "earn_1",
	earning_type: "commission",
};

describe("Commissions", () => {
	it("list returns OffsetPage with full commission shape", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: {
				success: true,
				data: [COMMISSION_FIXTURE],
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

		const page = await client.commissions.list();
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].affiliate_id).toBe("aff_1");
		expect(page.data[0].program_id).toBe("prog_1");
		expect(page.data[0].earning_id).toBe("earn_1");
	});

	it("create sends all required fields", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.referral_id).toBe("ref_1");
			expect(body.sale_amount).toBe(99);
			expect(body.sale_amount_currency).toBe("USD");
			expect(body.commission_amount).toBe(9.9);
			expect(body.commission_currency).toBe("USD");
			return {
				status: 201,
				body: { success: true, data: COMMISSION_FIXTURE },
			};
		});

		await client.commissions.create({
			referral_id: "ref_1",
			sale_amount: 99,
			sale_amount_currency: "USD",
			commission_amount: 9.9,
			commission_currency: "USD",
		});
	});

	it("update sends PUT with spec-correct fields", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PUT");
			const body = JSON.parse(init.body as string);
			expect(body.status).toBe("ready_for_payment");
			expect(body.hold_period_days).toBe(30);
			return {
				status: 200,
				body: { success: true, data: { ...COMMISSION_FIXTURE, status: "ready_for_payment" } },
			};
		});

		await client.commissions.update("com_1", { status: "ready_for_payment", hold_period_days: 30 });
	});

	it("del returns success message (200)", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Commission deleted" },
			};
		});

		const result = await client.commissions.del("com_1");
		expect(result.success).toBe(true);
	});
});
