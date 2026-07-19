import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

const RESPONSES = {
	form_id: "form_1",
	form_name: "Application",
	form_description: null,
	completed_at: null,
	questions: [
		{
			id: "q_1",
			question: "Website?",
			type: "text_input",
			is_required: true,
			options: [],
			order: 0,
			answer: "https://example.com",
		},
	],
};

function createClient(handler: (url: string, init: RequestInit) => unknown) {
	const fetch = vi.fn(async (url: string, init: RequestInit) => ({
		ok: true,
		status: 200,
		headers: new Headers(),
		json: async () => handler(url, init),
	})) as typeof globalThis.fetch;
	return new Affonso("sk_test", { baseUrl: "https://api.test/v1", fetch, maxRetries: 0 });
}

describe("Affiliate onboarding and portal", () => {
	it("retrieves onboarding responses", async () => {
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/affiliates/aff%2F1/onboarding-responses");
			expect(init.method).toBe("GET");
			return { success: true, data: RESPONSES };
		});
		expect((await client.affiliates.retrieveOnboardingResponses("aff/1")).form_id).toBe("form_1");
	});

	it("submits onboarding responses", async () => {
		const params = {
			responses: [{ question_id: "q_1", answer: "https://example.com" }],
			mark_complete: true,
		};
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/affiliates/aff_1/onboarding-responses");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			return { success: true, data: { ...RESPONSES, completed_at: "2026-01-01T00:00:00.000Z" } };
		});
		expect(
			(await client.affiliates.submitOnboardingResponses("aff_1", params)).completed_at,
		).not.toBeNull();
	});

	it("creates a portal token using the API's camelCase response", async () => {
		const data = {
			token: "jwt",
			portalUrl: "https://partners.example.com/auth/token?token=jwt",
			expiresAt: "2026-01-01T00:05:00.000Z",
		};
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/affiliates/aff_1/portal-token");
			expect(init.method).toBe("POST");
			expect(init.body).toBeUndefined();
			return { success: true, data };
		});
		expect((await client.affiliates.createPortalToken("aff_1")).portalUrl).toBe(data.portalUrl);
	});
});
