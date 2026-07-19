import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

const CONVERSION = {
	id: "txn_1",
	referral_id: "ref_1",
	affiliate_id: "aff_1",
	program_id: "prog_1",
	sale_amount: 100,
	sale_amount_currency: "USD",
	commission_amount: 20,
	commission_currency: "USD",
	status: "pending",
	sales_status: "complete",
	hold_period_days: 14,
	payment_intent_id: null,
	invoice_id: null,
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-01-01T00:00:00.000Z",
	earning_id: "earn_1",
	earning_type: "commission",
	external_event_id: "evt_1",
	calculation_mode: "auto",
	matched_incentive_id: "inc_1",
	replayed: false,
	source_event_id: "source_evt_1",
};

const MILESTONE = {
	referral_id: "ref_1",
	transaction_id: null,
	event_name: "demo_booked",
	event_type: "lead",
	external_event_id: "evt_2",
	action: "referral_updated",
	referral_status: "lead",
	replayed: false,
	source_event_id: "source_evt_2",
};

function createClient(
	handler: (url: string, init: RequestInit) => unknown,
	config?: { sourceSigningSecrets?: { custom?: string; segment?: string } },
) {
	const fetch = vi.fn(async (url: string, init: RequestInit) => ({
		ok: true,
		status: 201,
		headers: new Headers(),
		json: async () => handler(url, init),
	})) as typeof globalThis.fetch;
	return new Affonso("sk_test", {
		baseUrl: "https://api.test/v1",
		fetch,
		maxRetries: 0,
		signingSecret: "whsec_test",
		sourceSigningSecrets: config?.sourceSigningSecrets,
	});
}

function expectSigned(init: RequestInit) {
	expect(init.headers).toHaveProperty("X-Affonso-Timestamp", "1784462400");
	expect(init.headers).toHaveProperty("X-Affonso-Signature");
}

describe("S2S resources", () => {
	afterEach(() => vi.useRealTimers());

	it("creates a signup", async () => {
		const params = { click_id: "ref_1", email: "buyer@example.com" };
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/signups");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expect(init.headers).not.toHaveProperty("X-Affonso-Signature");
			return { success: true, data: { id: "ref_1" } };
		});
		expect((await client.signups.create(params)).id).toBe("ref_1");
	});

	it("creates a signed conversion", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = {
			referral_id: "ref_1",
			sale_amount: 100,
			external_event_id: "evt_1",
		};
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/conversions");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expectSigned(init);
			return { success: true, data: CONVERSION };
		});
		expect((await client.conversions.create(params)).calculation_mode).toBe("auto");
	});

	it("refunds a signed conversion", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = { amount: 25, currency: "USD", external_event_id: "refund_1" };
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/conversions/txn%2F1/refund");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expectSigned(init);
			return { success: true, data: { ...CONVERSION, sales_status: "partial_refunded" } };
		});
		expect((await client.conversions.refund("txn/1", params)).sales_status).toBe(
			"partial_refunded",
		);
	});

	it("creates a signed canonical event", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = { event_name: "demo_booked", event_type: "lead" as const, referral_id: "ref_1" };
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/events");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expectSigned(init);
			return { success: true, data: MILESTONE };
		});
		expect((await client.events.create(params)).event_name).toBe("demo_booked");
	});

	it("ingests a signed custom source event", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = { event_name: "kyc_passed", referral_id: "ref_1", event_type: "milestone" };
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/sources/custom/events");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expectSigned(init);
			return { success: true, data: { ...MILESTONE, event_name: "kyc_passed" } };
		});
		expect((await client.sources.ingest("custom", params)).event_name).toBe("kyc_passed");
	});

	it("uses the custom source secret when configured", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = { event_name: "kyc_passed", referral_id: "ref_1", event_type: "milestone" };
		const client = createClient(
			(_url, init) => {
				const timestamp = "1784462400";
				const expectedSignature = createHmac("sha256", "whsec_custom")
					.update(`${timestamp}.${JSON.stringify(params)}`)
					.digest("hex");
				expect(init.headers).toMatchObject({
					"X-Affonso-Signature": expectedSignature,
				});
				return { success: true, data: { ...MILESTONE, event_name: "kyc_passed" } };
			},
			{ sourceSigningSecrets: { custom: "whsec_custom" } },
		);
		await client.sources.ingest("custom", params);
	});

	it("ingests a signed Segment event", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
		const params = {
			type: "track" as const,
			event: "Order Completed",
			messageId: "msg_1",
			userId: "user_1",
			properties: { revenue: 100, currency: "USD" },
		};
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/sources/segment/events");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			expectSigned(init);
			return { success: true, data: CONVERSION };
		});
		expect((await client.sources.ingestSegment(params)).event_name).toBeUndefined();
	});
});
