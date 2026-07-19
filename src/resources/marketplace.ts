import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

export interface MarketplaceCommission {
	type: string;
	value: number;
	is_percentage: boolean;
	apply_to: string;
	has_multiple_tiers: boolean;
}

export interface MarketplaceTerms {
	cookie_lifetime_days: number;
	payment_frequency: string;
	payment_threshold: number;
}

export interface MarketplaceProgram {
	id: string;
	name: string;
	description: string | null;
	tagline: string | null;
	category: string | null;
	website_url: string;
	logo_url: string | null;
	access_mode: "public" | "private" | "invite";
	currency: string;
	commission: MarketplaceCommission | null;
	terms: MarketplaceTerms | null;
}

export interface MarketplaceListParams extends OffsetPaginationParams {
	category?: string;
}

export class Marketplace {
	constructor(private readonly httpClient: HttpClient) {}

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
