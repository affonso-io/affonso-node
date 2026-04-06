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

const PAYOUT_FIXTURE = {
	id: "pay_1",
	affiliate_id: "aff_1",
	invoice_number: 1001,
	amount: 50.0,
	status: "pending",
	payment_method: null,
	payment_reference: null,
	processed_at: null,
	managed_payout: false,
	affiliate: { name: "Max", email: "max@test.de" },
	created_at: "2025-01-01T00:00:00.000Z",
	updated_at: "2025-01-01T00:00:00.000Z",
};

describe("Payouts", () => {
	it("list returns OffsetPage with full payout shape", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: {
				success: true,
				data: [PAYOUT_FIXTURE],
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

		const page = await client.payouts.list();
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].invoice_number).toBe(1001);
		expect(page.data[0].amount).toBe(50.0);
		expect(page.data[0].managed_payout).toBe(false);
		expect(page.data[0].affiliate?.name).toBe("Max");
	});

	it("list passes affiliateId (camelCase per spec)", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("affiliateId=aff_1");
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

		await client.payouts.list({ affiliateId: "aff_1" });
	});

	it("retrieve returns PayoutDetail with transactions", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/payouts/pay_1");
			return {
				status: 200,
				body: {
					success: true,
					data: {
						...PAYOUT_FIXTURE,
						transactions: [
							{
								id: "txn_1",
								amount: 50.0,
								commission: {
									id: "com_1",
									amount: 99.0,
									commission_amount: 50.0,
									created_at: "2025-01-01T00:00:00.000Z",
								},
								created_at: "2025-01-01T00:00:00.000Z",
							},
						],
					},
				},
			};
		});

		const payout = await client.payouts.retrieve("pay_1");
		expect(payout.transactions).toHaveLength(1);
		expect(payout.transactions[0].commission.id).toBe("com_1");
	});

	it("update sends PUT (not PATCH) with required status", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PUT");
			const body = JSON.parse(init.body as string);
			expect(body.status).toBe("completed");
			expect(body.paymentReference).toBe("ref_abc");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...PAYOUT_FIXTURE, status: "completed", payment_reference: "ref_abc" },
				},
			};
		});

		await client.payouts.update("pay_1", { status: "completed", paymentReference: "ref_abc" });
	});
});
