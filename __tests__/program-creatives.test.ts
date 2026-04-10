import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";
import { OffsetPage } from "../src/pagination.js";

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

const CREATIVE_FIXTURE = {
	id: "cr_1",
	name: "Banner 1",
	description: "A banner",
	type: "image",
	url: null,
	file_url: "https://cdn.example.com/banner.png",
	width: 728,
	height: 90,
	created_at: "2025-01-01T00:00:00.000Z",
	updated_at: null,
};

describe("Program Creatives", () => {
	it("list returns OffsetPage", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/creatives");
			return {
				status: 200,
				body: {
					success: true,
					data: [CREATIVE_FIXTURE],
					pagination: {
						page: 1,
						limit: 10,
						total: 1,
						total_pages: 1,
						has_next_page: false,
						has_prev_page: false,
					},
				},
			};
		});

		const page = await client.program.creatives.list();
		expect(page).toBeInstanceOf(OffsetPage);
		expect(page.data[0].name).toBe("Banner 1");
	});

	it("create sends POST with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("Banner 2");
			expect(body.type).toBe("image");
			return {
				status: 201,
				body: { success: true, data: { ...CREATIVE_FIXTURE, id: "cr_2", name: "Banner 2" } },
			};
		});

		const creative = await client.program.creatives.create({
			name: "Banner 2",
			type: "image",
		});
		expect(creative.name).toBe("Banner 2");
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("Updated Banner");
			return {
				status: 200,
				body: { success: true, data: { ...CREATIVE_FIXTURE, name: "Updated Banner" } },
			};
		});

		const creative = await client.program.creatives.update("cr_1", { name: "Updated Banner" });
		expect(creative.name).toBe("Updated Banner");
	});

	it("del sends DELETE and returns success", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Creative deleted" },
			};
		});

		const result = await client.program.creatives.del("cr_1");
		expect(result.success).toBe(true);
	});
});
