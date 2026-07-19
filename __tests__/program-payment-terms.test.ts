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
	commission_duration: "lifetime",
	commissions_limit: null,
	commissions_hold_days: 14,
	payment_threshold: 50,
	payment_frequency: "monthly",
	payment_methods: ["paypal", "wise"],
	cookie_lifetime: 30,
	auto_payout: false,
	invoice_rule: "owner_provides",
	invoice_prefix: "AFF",
	require_tax_forms: true,
	owner_company_name: "Affonso GmbH",
	owner_address_line_1: "Main Street 1",
	owner_address_line_2: null,
	owner_city: "Berlin",
	owner_postal_code: "10115",
	owner_country: "DE",
	owner_vat_id: "DE123",
	owner_vat_rate: 19,
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
		expect(terms?.commission_type).toBe("percentage");
		expect(terms?.commission_rate).toBe(20);
		expect(terms?.cookie_lifetime).toBe(30);
	});

	it("retrieve returns null when payment terms are not configured", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: { success: true, data: null },
		}));

		expect(await client.program.paymentTerms.retrieve()).toBeNull();
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.commission_rate).toBe(30);
			expect(body.auto_payout).toBe(true);
			expect(body.commission_duration).toBe("payment_limited");
			expect(body.commissions_limit).toBe(12);
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
			commission_duration: "payment_limited",
			commissions_limit: 12,
		});
		expect(terms.commission_rate).toBe(30);
	});
});
