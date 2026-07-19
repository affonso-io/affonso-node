import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

describe("Public tracking", () => {
	it("sends the complete caller-provided tracking payload", async () => {
		const params = {
			programId: "prog_1",
			trackingId: "partner",
			referrer: "https://example.com",
			userAgent: "Test browser",
			gclid: "gclid_1",
			fbclid: "fbclid_1",
			li_fat_id: "linkedin_1",
			hasConsent: true,
		};
		const fetch = vi.fn(async (url: string, init: RequestInit) => {
			expect(url).toBe("https://api.test/v1/track");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(params);
			return {
				ok: true,
				status: 200,
				headers: new Headers(),
				json: async () => ({
					cid: "ref_1",
					data: { discount: null, affiliateCoupons: [] },
					append_affonso_id_enabled: true,
				}),
			} as Response;
		});
		const client = new Affonso("sk_test", {
			baseUrl: "https://api.test/v1",
			fetch,
			maxRetries: 0,
		});
		expect((await client.tracking.track(params)).cid).toBe("ref_1");
	});
});
