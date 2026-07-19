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

const TRACKING_FIXTURE = {
	default_referral_parameter: "ref",
	enabled_referral_parameters: ["ref", "via"],
	email_tracking_enabled: true,
	name_tracking_enabled: false,
	postbacks_enabled: true,
	append_affonso_id_enabled: true,
	tracking_template_enabled: false,
	tracking_template: null,
};

describe("Program Tracking", () => {
	it("retrieve returns tracking settings", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/tracking");
			return {
				status: 200,
				body: { success: true, data: TRACKING_FIXTURE },
			};
		});

		const settings = await client.program.tracking.retrieve();
		expect(settings.default_referral_parameter).toBe("ref");
		expect(settings.enabled_referral_parameters).toEqual(["ref", "via"]);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.name_tracking_enabled).toBe(true);
			expect(body.tracking_template_enabled).toBe(true);
			expect(body.tracking_template).toEqual([
				{ key: "partner", value: "{tracking_id}", type: "macro" },
			]);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...TRACKING_FIXTURE, name_tracking_enabled: true },
				},
			};
		});

		const settings = await client.program.tracking.update({
			name_tracking_enabled: true,
			tracking_template_enabled: true,
			tracking_template: [{ key: "partner", value: "{tracking_id}", type: "macro" }],
		});
		expect(settings.name_tracking_enabled).toBe(true);
	});
});
