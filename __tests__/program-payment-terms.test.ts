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

const PAYMENT_TERMS_FIXTURE = {
	commission_type: "percentage",
	commission_rate: 20,
	commission_duration: "forever",
	commission_duration_value: null,
	payment_threshold: 50,
	payment_frequency: "monthly",
	cookie_lifetime: 30,
	auto_payout: false,
	invoice_required: false,
	invoice_company_name: null,
	invoice_address: null,
	invoice_city: null,
	invoice_state: null,
	invoice_postal_code: null,
	invoice_country: null,
	invoice_vat_id: null,
	owner_first_name: null,
	owner_last_name: null,
	owner_email: null,
};

describe("Program Payment Terms", () => {
	it("retrieve returns payment terms", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/payment-terms");
			return {
				status: 200,
				body: { success: true, data: PAYMENT_TERMS_FIXTURE },
			};
		});

		const terms = await client.program.paymentTerms.retrieve();
		expect(terms.commission_type).toBe("percentage");
		expect(terms.commission_rate).toBe(20);
		expect(terms.cookie_lifetime).toBe(30);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.commission_rate).toBe(30);
			expect(body.auto_payout).toBe(true);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...PAYMENT_TERMS_FIXTURE, commission_rate: 30, auto_payout: true },
				},
			};
		});

		const terms = await client.program.paymentTerms.update({
			commission_rate: 30,
			auto_payout: true,
		});
		expect(terms.commission_rate).toBe(30);
	});
});
