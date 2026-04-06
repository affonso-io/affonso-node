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

describe("Clicks", () => {
	it("create sends POST and returns minimal click response", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.programId).toBe("prog_1");
			expect(body.trackingId).toBe("track_1");
			return {
				status: 201,
				body: {
					success: true,
					data: {
						id: "click_1",
						tracking_id: "track_1",
						program_id: "prog_1",
						created_at: "2025-01-01T00:00:00.000Z",
					},
				},
			};
		});

		const click = await client.clicks.create({
			programId: "prog_1",
			trackingId: "track_1",
		});
		// Response uses snake_case per ClickResponse interface
		expect(click.id).toBe("click_1");
		expect(click.tracking_id).toBe("track_1");
		expect(click.program_id).toBe("prog_1");
	});

	it("create sends optional UTM and ad click params", async () => {
		const client = createMockClient((_url, init) => {
			const body = JSON.parse(init.body as string);
			expect(body.utmSource).toBe("google");
			expect(body.gclid).toBe("abc123");
			expect(body.sub1).toBe("landing-page");
			return {
				status: 201,
				body: {
					success: true,
					data: {
						id: "click_2",
						tracking_id: "track_1",
						program_id: "prog_1",
						created_at: "2025-01-01T00:00:00.000Z",
					},
				},
			};
		});

		await client.clicks.create({
			programId: "prog_1",
			trackingId: "track_1",
			utmSource: "google",
			gclid: "abc123",
			sub1: "landing-page",
		});
	});
});
