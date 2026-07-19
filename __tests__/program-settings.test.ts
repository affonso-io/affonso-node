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

const PROGRAM_FIXTURE = {
	id: "prog_1",
	name: "My Program",
	slug: "my-program",
	tagline: "Best program",
	category: "saas",
	description: "A great program",
	website_url: "https://example.com",
	logo_url: null,
	access_mode: "private",
	status: "active",
	affiliate_links_enabled: true,
	default_referral_parameter: "ref",
	plan: {
		tier: "growth",
		postbacks: true,
		groups_limit: 5,
	},
	created_at: "2025-01-01T00:00:00.000Z",
	updated_at: "2025-01-02T00:00:00.000Z",
};

describe("Program Settings", () => {
	it("retrieve returns program info", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program");
			return {
				status: 200,
				body: { success: true, data: PROGRAM_FIXTURE },
			};
		});

		const program = await client.program.retrieve();
		expect(program.id).toBe("prog_1");
		expect(program.name).toBe("My Program");
		expect(program.access_mode).toBe("private");
		expect(program.plan).toEqual({ tier: "growth", postbacks: true, groups_limit: 5 });
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("Updated Program");
			expect(body.access_mode).toBe("PUBLIC");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...PROGRAM_FIXTURE, name: "Updated Program", access_mode: "public" },
				},
			};
		});

		const program = await client.program.update({
			name: "Updated Program",
			access_mode: "PUBLIC",
		});
		expect(program.name).toBe("Updated Program");
	});
});
