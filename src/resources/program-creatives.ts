import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { DeleteResponse, OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

export type CreativeCategory = "brand" | "banner" | "product" | "content" | "video" | "document";

export interface CreativeDimensions {
	width: number;
	height: number;
}

export interface Creative {
	id: string;
	name: string | null;
	description: string | null;
	category: CreativeCategory | null;
	subcategory: string | null;
	url: string | null;
	content: string | null;
	tags: string[];
	dimensions: CreativeDimensions | null;
	usage_notes: string | null;
	restrictions: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreativeListParams extends OffsetPaginationParams {
	category?: string;
}

export interface CreativeCreateParams {
	name?: string | null;
	description?: string | null;
	category?: CreativeCategory | null;
	subcategory?: string | null;
	url?: string | null;
	content?: string | null;
	tags?: string[];
	dimensions?: CreativeDimensions | null;
	usage_notes?: string | null;
	restrictions?: string | null;
}

export type CreativeUpdateParams = CreativeCreateParams;

export class ProgramCreatives {
	constructor(private readonly httpClient: HttpClient) {}

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
		return this.httpClient.request({
			method: "DELETE",
			path: `/program/creatives/${encodeURIComponent(id)}`,
		});
	}
}
