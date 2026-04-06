import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { DeleteResponse, OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types (from OpenAPI Commission schema + transformCommission) ---

export type CommissionStatus =
	| "pending"
	| "pending_manual_approval"
	| "ready_for_payment"
	| "processing_payout"
	| "paid"
	| "declined"
	| "refunded"
	| "dispute";

export type SalesStatus =
	| "open"
	| "complete"
	| "trialing"
	| "failed"
	| "refunded"
	| "partial_refunded";

export interface Commission {
	id: string;
	referral_id: string;
	affiliate_id: string | null;
	program_id: string | null;
	sale_amount: number;
	sale_amount_currency: string;
	commission_amount: number;
	commission_currency: string;
	status: string;
	sales_status: string;
	hold_period_days: number | null;
	payment_intent_id: string | null;
	invoice_id: string | null;
	created_at: string;
	updated_at: string;
	earning_id: string | null;
	earning_type: string | null;
	// Expandable
	affiliate?: unknown;
	affiliate_program?: unknown;
	referral?: unknown;
}

// --- Query/Input Types (from Zod schemas) ---

export type CommissionExpand = "affiliate" | "affiliate_program" | "referral";

export interface CommissionListParams extends OffsetPaginationParams {
	status?: CommissionStatus;
	sales_status?: SalesStatus;
	referral_id?: string;
	affiliate_id?: string;
	expand?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface CommissionRetrieveParams {
	expand?: string;
}

export interface CommissionCreateParams {
	referral_id: string;
	sale_amount: number;
	sale_amount_currency: string;
	commission_amount: number;
	commission_currency: string;
	is_subscription?: boolean;
	status?: CommissionStatus;
	sales_status?: SalesStatus;
	payment_intent_id?: string;
	hold_period_days?: number;
	created_at?: string;
}

export interface CommissionUpdateParams {
	status?: CommissionStatus;
	sales_status?: SalesStatus;
	hold_period_days?: number;
	sale_amount?: number;
	sale_amount_currency?: string;
	commission_amount?: number;
	commission_currency?: string;
}

// --- Resource ---

export class Commissions {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: CommissionListParams): Promise<OffsetPage<Commission>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/commissions", query };
		const response = await this.httpClient.request<{
			data: Commission[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string, params?: CommissionRetrieveParams): Promise<Commission> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Commission }>({
			method: "GET",
			path: `/commissions/${encodeURIComponent(id)}`,
			query,
		});
		return response.data;
	}

	async create(params: CommissionCreateParams): Promise<Commission> {
		const response = await this.httpClient.request<{ data: Commission }>({
			method: "POST",
			path: "/commissions",
			body: params,
		});
		return response.data;
	}

	async update(id: string, params: CommissionUpdateParams): Promise<Commission> {
		const response = await this.httpClient.request<{ data: Commission }>({
			method: "PUT",
			path: `/commissions/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/commissions/${encodeURIComponent(id)}`,
		});
	}
}
