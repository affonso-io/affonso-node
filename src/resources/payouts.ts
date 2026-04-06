import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types (from OpenAPI Payout schema + transformPayout) ---

export type PayoutStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface Payout {
	id: string;
	affiliate_id: string;
	invoice_number: number;
	amount: number;
	status: string;
	payment_method: string | null;
	payment_reference: string | null;
	processed_at: string | null;
	managed_payout: boolean;
	affiliate: {
		name: string | null;
		email: string | null;
	} | null;
	created_at: string;
	updated_at: string;
}

export interface PayoutTransaction {
	id: string;
	amount: number;
	commission: {
		id: string;
		amount: number;
		commission_amount: number;
		created_at: string;
	};
	created_at: string;
}

export interface PayoutDetail extends Payout {
	transactions: PayoutTransaction[];
}

// --- Query/Input Types (from Zod schemas) ---

export interface PayoutListParams extends OffsetPaginationParams {
	status?: PayoutStatus;
	affiliateId?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface PayoutUpdateParams {
	status: PayoutStatus;
	paymentMethod?: string;
	paymentReference?: string;
}

// --- Resource ---

export class Payouts {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: PayoutListParams): Promise<OffsetPage<Payout>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/payouts", query };
		const response = await this.httpClient.request<{
			data: Payout[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string): Promise<PayoutDetail> {
		const response = await this.httpClient.request<{ data: PayoutDetail }>({
			method: "GET",
			path: `/payouts/${encodeURIComponent(id)}`,
		});
		return response.data;
	}

	async update(id: string, params: PayoutUpdateParams): Promise<Payout> {
		const response = await this.httpClient.request<{ data: Payout }>({
			method: "PUT",
			path: `/payouts/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}
}
