import type { HttpClient } from "./http.js";
import type { OffsetPaginationMeta, RequestOptions } from "./types.js";

export class OffsetPage<T> {
	readonly data: T[];
	readonly pagination: OffsetPaginationMeta;

	private readonly httpClient: HttpClient;
	private readonly requestOpts: RequestOptions;

	constructor(
		data: T[],
		pagination: OffsetPaginationMeta,
		httpClient: HttpClient,
		requestOpts: RequestOptions,
	) {
		this.data = data;
		this.pagination = pagination;
		this.httpClient = httpClient;
		this.requestOpts = requestOpts;
	}

	async getNextPage(): Promise<OffsetPage<T> | null> {
		if (!this.pagination.has_next_page) return null;

		const nextOpts: RequestOptions = {
			...this.requestOpts,
			query: {
				...this.requestOpts.query,
				page: this.pagination.page + 1,
			},
		};

		const response = await this.httpClient.request<{
			data: T[];
			pagination: OffsetPaginationMeta;
		}>(nextOpts);

		return new OffsetPage(response.data, response.pagination, this.httpClient, nextOpts);
	}

	async *autoPaginate(maxPages = 1000): AsyncIterableIterator<T> {
		let page: OffsetPage<T> | null = this;
		let pageCount = 0;
		while (page && pageCount < maxPages) {
			for (const item of page.data) {
				yield item;
			}
			pageCount++;
			page = await page.getNextPage();
		}
	}
}

export class CursorPage<T extends { id: string }> {
	readonly data: T[];
	readonly hasMore: boolean;

	private readonly httpClient: HttpClient;
	private readonly requestOpts: RequestOptions;

	constructor(data: T[], hasMore: boolean, httpClient: HttpClient, requestOpts: RequestOptions) {
		this.data = data;
		this.hasMore = hasMore;
		this.httpClient = httpClient;
		this.requestOpts = requestOpts;
	}

	async getNextPage(): Promise<CursorPage<T> | null> {
		if (!this.hasMore || this.data.length === 0) return null;

		const lastId = this.data[this.data.length - 1].id;
		const nextOpts: RequestOptions = {
			...this.requestOpts,
			query: {
				...this.requestOpts.query,
				starting_after: lastId,
			},
		};

		const response = await this.httpClient.request<{
			data: T[];
			has_more: boolean;
		}>(nextOpts);

		return new CursorPage(response.data, response.has_more, this.httpClient, nextOpts);
	}

	async *autoPaginate(maxPages = 1000): AsyncIterableIterator<T> {
		let page: CursorPage<T> | null = this;
		let pageCount = 0;
		while (page && pageCount < maxPages) {
			for (const item of page.data) {
				yield item;
			}
			pageCount++;
			page = await page.getNextPage();
		}
	}
}
