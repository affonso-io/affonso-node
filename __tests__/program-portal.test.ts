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
	primary_color: "#000000",
	accent_color: "#ffffff",
	logo_url: null,
	favicon_url: null,
	custom_domain: null,
	terms_url: null,
	privacy_url: null,
	custom_texts: null,
	onboarding_enabled: true,
	resources_enabled: false,
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
		expect(portal.primary_color).toBe("#000000");
		expect(portal.onboarding_enabled).toBe(true);
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.primary_color).toBe("#ff0000");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...PORTAL_FIXTURE, primary_color: "#ff0000" },
				},
			};
		});

		const portal = await client.program.portal.update({ primary_color: "#ff0000" });
		expect(portal.primary_color).toBe("#ff0000");
	});
});
