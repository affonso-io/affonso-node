import { describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../src/http.js";
import { CursorPage, OffsetPage } from "../src/pagination.js";

function createMockHttpClient(responses: unknown[]) {
	let callIndex = 0;
	const request = vi.fn(async () => {
		return responses[callIndex++];
	});
	return { request } as unknown as HttpClient;
}

describe("OffsetPage", () => {
	it("returns data and pagination", () => {
		const page = new OffsetPage(
			[{ id: "1" }, { id: "2" }],
			{ page: 1, limit: 2, total: 4, total_pages: 2, has_next_page: true, has_prev_page: false },
			createMockHttpClient([]),
			{ method: "GET", path: "/test", query: {} },
		);

		expect(page.data).toHaveLength(2);
		expect(page.pagination.has_next_page).toBe(true);
	});

	it("getNextPage returns next page", async () => {
		const mockClient = createMockHttpClient([
			{
				data: [{ id: "3" }],
				pagination: {
					page: 2,
					limit: 2,
					total: 3,
					total_pages: 2,
					has_next_page: false,
					has_prev_page: true,
				},
			},
		]);

		const page = new OffsetPage(
			[{ id: "1" }, { id: "2" }],
			{ page: 1, limit: 2, total: 3, total_pages: 2, has_next_page: true, has_prev_page: false },
			mockClient,
			{ method: "GET", path: "/test", query: { page: 1 } },
		);

		const next = await page.getNextPage();
		expect(next).not.toBeNull();
		expect(next?.data).toEqual([{ id: "3" }]);
		expect(next?.pagination.page).toBe(2);
	});

	it("getNextPage returns null when no next page", async () => {
		const page = new OffsetPage(
			[{ id: "1" }],
			{ page: 1, limit: 10, total: 1, total_pages: 1, has_next_page: false, has_prev_page: false },
			createMockHttpClient([]),
			{ method: "GET", path: "/test", query: {} },
		);

		const next = await page.getNextPage();
		expect(next).toBeNull();
	});

	it("autoPaginate yields all items across pages", async () => {
		const mockClient = createMockHttpClient([
			{
				data: [{ id: "3" }],
				pagination: {
					page: 2,
					limit: 2,
					total: 3,
					total_pages: 2,
					has_next_page: false,
					has_prev_page: true,
				},
			},
		]);

		const page = new OffsetPage(
			[{ id: "1" }, { id: "2" }],
			{ page: 1, limit: 2, total: 3, total_pages: 2, has_next_page: true, has_prev_page: false },
			mockClient,
			{ method: "GET", path: "/test", query: { page: 1 } },
		);

		const items: unknown[] = [];
		for await (const item of page.autoPaginate()) {
			items.push(item);
		}

		expect(items).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
	});
});

describe("CursorPage", () => {
	it("returns data and hasMore", () => {
		const page = new CursorPage([{ id: "a" }, { id: "b" }], true, createMockHttpClient([]), {
			method: "GET",
			path: "/test",
			query: {},
		});

		expect(page.data).toHaveLength(2);
		expect(page.hasMore).toBe(true);
	});

	it("getNextPage uses last item id as cursor", async () => {
		const mockClient = createMockHttpClient([{ data: [{ id: "c" }], has_more: false }]);

		const page = new CursorPage([{ id: "a" }, { id: "b" }], true, mockClient, {
			method: "GET",
			path: "/test",
			query: {},
		});

		const next = await page.getNextPage();
		expect(next).not.toBeNull();
		expect(next?.data).toEqual([{ id: "c" }]);
		expect(next?.hasMore).toBe(false);

		expect(mockClient.request).toHaveBeenCalledWith(
			expect.objectContaining({ query: { starting_after: "b" } }),
		);
	});

	it("getNextPage returns null when hasMore is false", async () => {
		const page = new CursorPage([{ id: "a" }], false, createMockHttpClient([]), {
			method: "GET",
			path: "/test",
			query: {},
		});

		expect(await page.getNextPage()).toBeNull();
	});

	it("autoPaginate yields all items across pages", async () => {
		const mockClient = createMockHttpClient([{ data: [{ id: "c" }], has_more: false }]);

		const page = new CursorPage([{ id: "a" }, { id: "b" }], true, mockClient, {
			method: "GET",
			path: "/test",
			query: {},
		});

		const items: unknown[] = [];
		for await (const item of page.autoPaginate()) {
			items.push(item);
		}

		expect(items).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
	});
});
