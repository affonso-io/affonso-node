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

const PORTAL_FIXTURE = {
	single_program_portal: true,
	hide_branding: false,
	hide_details: false,
	primary_color: "#000000",
	secondary_color: "#ffffff",
	show_leaderboard: true,
	terms_conditions_status: true,
	terms_conditions_value: "Terms",
	privacy_policy_status: true,
	privacy_policy_value: "Privacy",
	support_email_status: true,
	support_email_value: "support@example.com",
	custom_texts: { welcome: "Welcome" },
};

describe("Program Portal", () => {
	it("retrieve returns portal settings", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/portal");
			return {
				status: 200,
				body: { success: true, data: PORTAL_FIXTURE },
			};
		});

		const portal = await client.program.portal.retrieve();
		expect(portal?.primary_color).toBe("#000000");
		expect(portal?.single_program_portal).toBe(true);
	});

	it("retrieve returns null when portal settings are not configured", async () => {
		const client = createMockClient(() => ({
			status: 200,
			body: { success: true, data: null },
		}));

		expect(await client.program.portal.retrieve()).toBeNull();
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.primary_color).toBe("#ff0000");
			expect(body.show_leaderboard).toBe(false);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...PORTAL_FIXTURE, primary_color: "#ff0000" },
				},
			};
		});

		const portal = await client.program.portal.update({
			primary_color: "#ff0000",
			show_leaderboard: false,
		});
		expect(portal.primary_color).toBe("#ff0000");
	});
});
