import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { DeleteResponse, OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types (from OpenAPI Coupon schema + transformCoupon) ---

export type DiscountType = "percentage" | "fixed";
export type Duration = "forever" | "once" | "repeating";
export type CouponProvider = "stripe" | "dodo" | "polar" | "creem" | "paddle";

export interface Coupon {
	id: string;
	affiliate_id: string;
	program_id: string;
	code: string;
	discount_type: string | null;
	discount_value: number | null;
	duration: string | null;
	duration_in_months: number | null;
	product_ids: string[];
	provider: string | null;
	provider_coupon_id: string | null;
	provider_promo_code_id: string | null;
	created_at: string;
	updated_at: string | null;
	// Expandable
	affiliate?: unknown;
}

// --- Query/Input Types (from Zod schemas) ---

export interface CouponListParams extends OffsetPaginationParams {
	affiliate_id?: string;
	program_id?: string;
	search?: string;
	sort?: string;
	expand?: string;
}

export interface CouponRetrieveParams {
	expand?: string;
}

export interface CouponCreateParams {
	affiliate_id: string;
	code: string;
	discount_type: DiscountType;
	discount_value: number;
	duration: Duration;
	duration_in_months?: number;
	currency?: string;
	product_ids?: string[];
}

// --- Resource ---
// Note: OpenAPI spec only defines GET (list), GET (retrieve), POST (create), DELETE.
// No PUT/PATCH update endpoint for coupons.

export class Coupons {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: CouponListParams): Promise<OffsetPage<Coupon>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/coupons", query };
		const response = await this.httpClient.request<{
			data: Coupon[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string, params?: CouponRetrieveParams): Promise<Coupon> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Coupon }>({
			method: "GET",
			path: `/coupons/${encodeURIComponent(id)}`,
			query,
		});
		return response.data;
	}

	async create(params: CouponCreateParams): Promise<Coupon> {
		const response = await this.httpClient.request<{ data: Coupon }>({
			method: "POST",
			path: "/coupons",
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/coupons/${encodeURIComponent(id)}`,
		});
	}
}
