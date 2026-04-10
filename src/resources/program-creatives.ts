import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { DeleteResponse, OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types ---

export interface Creative {
	id: string;
	name: string;
	description: string | null;
	type: string;
	url: string | null;
	file_url: string | null;
	width: number | null;
	height: number | null;
	created_at: string;
	updated_at: string | null;
}

// --- Query/Input Types ---

export interface CreativeListParams extends OffsetPaginationParams {
	type?: string;
	search?: string;
}

export interface CreativeCreateParams {
	name: string;
	description?: string | null;
	type: string;
	url?: string | null;
	file_url?: string | null;
	width?: number | null;
	height?: number | null;
}

export interface CreativeUpdateParams {
	name?: string;
	description?: string | null;
	type?: string;
	url?: string | null;
	file_url?: string | null;
	width?: number | null;
	height?: number | null;
}

// --- Resource ---

export class ProgramCreatives {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: CreativeListParams): Promise<OffsetPage<Creative>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/program/creatives", query };
		const response = await this.httpClient.request<{
			data: Creative[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string): Promise<Creative> {
		const response = await this.httpClient.request<{ data: Creative }>({
			method: "GET",
			path: `/program/creatives/${encodeURIComponent(id)}`,
		});
		return response.data;
	}

	async create(params: CreativeCreateParams): Promise<Creative> {
		const response = await this.httpClient.request<{ data: Creative }>({
			method: "POST",
			path: "/program/creatives",
			body: params,
		});
		return response.data;
	}

	async update(id: string, params: CreativeUpdateParams): Promise<Creative> {
		const response = await this.httpClient.request<{ data: Creative }>({
			method: "PATCH",
			path: `/program/creatives/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/program/creatives/${encodeURIComponent(id)}`,
		});
	}
}
