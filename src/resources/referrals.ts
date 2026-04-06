import type { HttpClient } from "../http.js";
import { CursorPage } from "../pagination.js";
import type { CursorPaginationParams, DeleteResponse } from "../types.js";

// --- Response Types (from OpenAPI Referral schema + transformReferralPublic) ---

export type ReferralStatus = "lead" | "trialing" | "customer" | "active" | "canceled" | "rejected";

export interface Referral {
	id: string;
	affiliate_id: string;
	program_id: string;
	email: string | null;
	customer_id: string | null;
	subscription_id: string | null;
	status: string;
	name: string | null;
	metadata: unknown;
	created_at: string;
	converted_at: string | null;
	// Expandable
	affiliate?: unknown;
	// Includable
	stats?: ReferralStats;
}

export interface ReferralStats {
	total_revenue: number;
	total_commission: number;
	total_orders: number;
	last_order_at: string | null;
}

// --- Query/Input Types (from Zod schemas) ---

export interface ReferralListParams extends CursorPaginationParams {
	affiliate_id?: string;
	order?: "asc" | "desc";
	status?: ReferralStatus;
	expand?: string;
	created_gte?: string;
	created_lte?: string;
}

export interface ReferralRetrieveParams {
	expand?: string;
	include?: string;
}

export interface ReferralCreateParams {
	email: string;
	affiliate_id: string;
	subscription_id?: string;
	customer_id?: string;
	click_id?: string;
	created_at?: string;
	status?: ReferralStatus;
	name?: string;
	metadata?: Record<string, unknown>;
}

export interface ReferralUpdateParams {
	email?: string;
	subscription_id?: string;
	customer_id?: string;
	status?: ReferralStatus;
	name?: string;
	metadata?: Record<string, unknown>;
}

// --- Resource ---

export class Referrals {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: ReferralListParams): Promise<CursorPage<Referral>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/referrals", query };
		const response = await this.httpClient.request<{
			data: Referral[];
			has_more: boolean;
		}>(requestOpts);
		return new CursorPage(response.data, response.has_more, this.httpClient, requestOpts);
	}

	async retrieve(id: string, params?: ReferralRetrieveParams): Promise<Referral> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Referral }>({
			method: "GET",
			path: `/referrals/${encodeURIComponent(id)}`,
			query,
		});
		return response.data;
	}

	async create(params: ReferralCreateParams): Promise<Referral> {
		const response = await this.httpClient.request<{ data: Referral }>({
			method: "POST",
			path: "/referrals",
			body: params,
		});
		return response.data;
	}

	async update(id: string, params: ReferralUpdateParams): Promise<Referral> {
		const response = await this.httpClient.request<{ data: Referral }>({
			method: "PUT",
			path: `/referrals/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/referrals/${encodeURIComponent(id)}`,
		});
	}
}
