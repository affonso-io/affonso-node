import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types ---

export interface MarketplaceProgram {
	id: string;
	name: string;
	tagline: string | null;
	category: string | null;
	description: string | null;
	website_url: string | null;
	logo_url: string | null;
	commission_type: string | null;
	commission_rate: number | null;
	cookie_lifetime: number | null;
	created_at: string;
}

// --- Query Types ---

export interface MarketplaceListParams extends OffsetPaginationParams {
	category?: string;
	search?: string;
	sort?: string;
}

// --- Resource ---

export class Marketplace {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: MarketplaceListParams): Promise<OffsetPage<MarketplaceProgram>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/marketplace", query };
		const response = await this.httpClient.request<{
			data: MarketplaceProgram[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string): Promise<MarketplaceProgram> {
		const response = await this.httpClient.request<{ data: MarketplaceProgram }>({
			method: "GET",
			path: `/marketplace/${encodeURIComponent(id)}`,
		});
		return response.data;
	}
}
