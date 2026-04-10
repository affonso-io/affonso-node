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

const GROUP_FIXTURE = {
	id: "grp_1",
	name: "Default Group",
	description: null,
	is_default: true,
	affiliate_count: 5,
	created_at: "2025-01-01T00:00:00.000Z",
};

describe("Program Groups", () => {
	it("list returns array of groups", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/groups");
			return {
				status: 200,
				body: { success: true, data: [GROUP_FIXTURE] },
			};
		});

		const groups = await client.program.groups.list();
		expect(groups).toHaveLength(1);
		expect(groups[0].id).toBe("grp_1");
	});

	it("list passes expand param", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("expand=incentives");
			return {
				status: 200,
				body: {
					success: true,
					data: [{ ...GROUP_FIXTURE, incentives: [] }],
				},
			};
		});

		const groups = await client.program.groups.list({ expand: "incentives" });
		expect(groups[0].incentives).toEqual([]);
	});

	it("retrieve returns single group", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/groups/grp_1");
			return {
				status: 200,
				body: { success: true, data: GROUP_FIXTURE },
			};
		});

		const group = await client.program.groups.retrieve("grp_1");
		expect(group.name).toBe("Default Group");
	});

	it("create sends POST with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("VIP");
			return {
				status: 201,
				body: { success: true, data: { ...GROUP_FIXTURE, id: "grp_2", name: "VIP" } },
			};
		});

		const group = await client.program.groups.create({ name: "VIP" });
		expect(group.name).toBe("VIP");
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.name).toBe("Premium");
			return {
				status: 200,
				body: { success: true, data: { ...GROUP_FIXTURE, name: "Premium" } },
			};
		});

		const group = await client.program.groups.update("grp_1", { name: "Premium" });
		expect(group.name).toBe("Premium");
	});

	it("del sends DELETE and returns success", async () => {
		const client = createMockClient((_url, init) => {
			expect(init.method).toBe("DELETE");
			return {
				status: 200,
				body: { success: true, message: "Group deleted" },
			};
		});

		const result = await client.program.groups.del("grp_1");
		expect(result.success).toBe(true);
	});
});
