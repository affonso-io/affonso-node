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
	self_referral: "block",
	self_referral_config: null,
	duplicate_ip: "detect",
	duplicate_ip_config: { threshold: 5, window_hours: 24 },
	vpn_proxy: "off",
	vpn_proxy_config: null,
	suspicious_conversion: "detect",
	suspicious_conversion_config: { threshold: 10, window_hours: 1 },
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
		expect(rules.self_referral).toBe("block");
		expect(rules.duplicate_ip).toBe("detect");
		expect(rules.duplicate_ip_config?.threshold).toBe(5);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.vpn_proxy).toBe("block");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...FRAUD_RULES_FIXTURE, vpn_proxy: "block" },
				},
			};
		});

		const rules = await client.program.fraudRules.update({ vpn_proxy: "block" });
		expect(rules.vpn_proxy).toBe("block");
	});
});
