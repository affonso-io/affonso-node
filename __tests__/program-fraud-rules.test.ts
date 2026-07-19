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

const FRAUD_RULES_FIXTURE = {
	self_referral_mode: "block",
	cross_program_ban_mode: "detect",
	duplicate_payout_mode: "detect",
	suspicious_email_mode: "off",
	banned_referral_mode: "block",
	paid_traffic_mode: "detect",
	blocked_country_mode: "off",
	banned_referral_config: { emails: ["blocked@example.com"] },
	blocked_country_config: null,
	paid_traffic_config: { sources: ["search"] },
};

describe("Program Fraud Rules", () => {
	it("retrieve returns fraud rules", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/fraud-rules");
			return {
				status: 200,
				body: { success: true, data: FRAUD_RULES_FIXTURE },
			};
		});

		const rules = await client.program.fraudRules.retrieve();
		expect(rules.self_referral_mode).toBe("block");
		expect(rules.duplicate_payout_mode).toBe("detect");
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.paid_traffic_mode).toBe("block");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...FRAUD_RULES_FIXTURE, paid_traffic_mode: "block" },
				},
			};
		});

		const rules = await client.program.fraudRules.update({ paid_traffic_mode: "block" });
		expect(rules.paid_traffic_mode).toBe("block");
	});
});
