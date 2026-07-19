import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

const FORM = {
	id: "form_1",
	name: "Application",
	description: "Tell us about yourself",
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-01-01T00:00:00.000Z",
	questions: [
		{
			id: "q_1",
			question: "Primary channel?",
			type: "single_choice",
			is_required: true,
			options: ["SEO", "Paid"],
			order: 0,
		},
	],
};

function createClient(handler: (url: string, init: RequestInit) => unknown) {
	const fetch = vi.fn(async (url: string, init: RequestInit) => {
		const body = handler(url, init);
		return {
			ok: true,
			status: init.method === "POST" ? 201 : 200,
			headers: new Headers(),
			json: async () => body,
		} as Response;
	});
	return new Affonso("sk_test", { baseUrl: "https://api.test/v1", fetch, maxRetries: 0 });
}

describe("Onboarding form", () => {
	it("retrieves the form", async () => {
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/onboarding-form");
			expect(init.method).toBe("GET");
			return { success: true, data: FORM };
		});
		expect((await client.onboardingForm.retrieve()).questions[0].type).toBe("single_choice");
	});

	it("creates the form", async () => {
		const params = {
			name: "Application",
			questions: [
				{
					question: "Primary channel?",
					type: "single_choice" as const,
					is_required: true,
					options: ["SEO", "Paid"],
					order: 0,
				},
			],
		};
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/onboarding-form");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			return { success: true, data: FORM };
		});
		expect((await client.onboardingForm.create(params)).id).toBe("form_1");
	});

	it("updates the form", async () => {
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/onboarding-form");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({ description: null });
			return { success: true, data: { ...FORM, description: null } };
		});
		expect((await client.onboardingForm.update({ description: null })).description).toBeNull();
	});

	it("deletes the form", async () => {
		const client = createClient((url, init) => {
			expect(url).toBe("https://api.test/v1/onboarding-form");
			expect(init.method).toBe("DELETE");
			expect(init.body).toBeUndefined();
			return { success: true, message: "Onboarding form deleted successfully" };
		});
		expect((await client.onboardingForm.del()).success).toBe(true);
	});
});
