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

describe("Embed Tokens", () => {
	it("create sends POST with correct body", async () => {
		const client = createMockClient((url, init) => {
			expect(url).toContain("/embed/token");
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.email).toBe("user@test.com");
			expect(body.name).toBe("Test User");
			return {
				status: 201,
				body: {
					success: true,
					data: {
						publicToken: "pt_abc123",
						expiresAt: "2025-01-02T00:00:00.000Z",
						link: "https://example.com/embed?token=pt_abc123",
						portalUrl: "https://portal.example.com",
						partnershipStatus: "approved",
					},
				},
			};
		});

		const token = await client.embedTokens.create({
			email: "user@test.com",
			name: "Test User",
		});
		expect(token.publicToken).toBe("pt_abc123");
		expect(token.portalUrl).toBe("https://portal.example.com");
		expect(token.partnershipStatus).toBe("approved");
	});
});
