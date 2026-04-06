import type { HttpClient } from "../http.js";
import { OffsetPage } from "../pagination.js";
import type { DeleteResponse, OffsetPaginationMeta, OffsetPaginationParams } from "../types.js";

// --- Response Types (from OpenAPI spec + transformAffiliate) ---

export interface AffiliatePromoCode {
	code: string;
	promo_code_id: string | null;
	coupon_id: string | null;
	discount_type: string | null;
	discount_value: number | null;
	duration: string | null;
	created_at: string;
}

export interface CommissionOverride {
	id: string;
	incentive_id: string;
	incentive_name: string;
	incentive_type: string;
	amount: number;
	is_percentage: boolean;
	apply_to: string;
	product_ids: string[];
	approval_type: string;
	hold_period_days: number | null;
	incentive_length: string;
	length_value: number | null;
	variable_commission: boolean;
	variable_config: unknown;
}

export interface InvoiceDetails {
	company_name: string | null;
	first_name: string;
	last_name: string;
	address_line_1: string;
	address_line_2: string | null;
	city: string;
	postal_code: string | null;
	state: string | null;
	country: string;
	vat_id: string | null;
	tax_id: string | null;
}

export interface PayoutMethodResponse {
	type: string;
	details: Record<string, string | null>;
}

export interface OnboardingQuestion {
	id: string;
	question: string;
	type: string;
	is_required: boolean;
	options: string[];
	order: number;
	answer: unknown;
}

export interface OnboardingResponses {
	form_name: string;
	form_description: string | null;
	completed_at: string;
	questions: OnboardingQuestion[];
}

export interface Affiliate {
	id: string;
	name: string | null;
	email: string | null;
	tracking_id: string | null;
	source: string | null;
	partnership_status: string | null;
	onboarding_completed: boolean;
	program_id: string | null;
	group_id: string | null;
	external_user_id: string | null;
	metadata: unknown;
	created_at: string;
	// Expandable fields
	promoCodes?: AffiliatePromoCode[];
	commissionOverrides?: CommissionOverride[];
	invoiceDetails?: InvoiceDetails | null;
	payoutMethod?: PayoutMethodResponse | null;
	onboardingResponses?: OnboardingResponses | null;
}

// --- Query/Input Types (from Zod schemas) ---

export type PartnershipStatus = "pending" | "approved" | "rejected";

export type AffiliateExpandField =
	| "promoCodes"
	| "commissionOverrides"
	| "invoiceDetails"
	| "payoutMethod"
	| "onboardingResponses";

export interface AffiliateListParams extends OffsetPaginationParams {
	partnership_status?: PartnershipStatus | null;
	search?: string;
	group_id?: string;
	program_id?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
	expand?: string;
}

export interface AffiliateRetrieveParams {
	expand?: string;
}

export type PayoutMethod =
	| "paypal"
	| "wise"
	| "payoneer"
	| "paxum"
	| "webmoney"
	| "skrill"
	| "wire_transfer"
	| "ach"
	| "bitcoin"
	| "ethereum"
	| "alipay"
	| "wechat"
	| "manual"
	| "none";

export interface PayoutDetails {
	email?: string;
	accountId?: string;
	address?: string;
	bankName?: string;
	accountNumber?: string;
	swiftCode?: string;
	iban?: string;
	routingNumber?: string;
	accountName?: string;
}

export interface AffiliateCreateParams {
	name: string;
	email: string;
	program_id: string;
	tracking_id?: string;
	group_id?: string;
	company_name?: string;
	country_code?: string;
	onboarding_completed?: boolean;
	payout_method?: PayoutMethod;
	payout_details?: PayoutDetails;
	external_user_id?: string;
	metadata?: Record<string, unknown>;
}

export interface AffiliateUpdateParams {
	name?: string;
	email?: string;
	group_id?: string | null;
	company_name?: string | null;
	country_code?: string | null;
	payout_method?: PayoutMethod;
	payout_details?: PayoutDetails;
	status?: PartnershipStatus;
	onboarding_completed?: boolean;
	external_user_id?: string | null;
	metadata?: Record<string, unknown> | null;
}

// --- Resource ---

export class Affiliates {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: AffiliateListParams): Promise<OffsetPage<Affiliate>> {
		const query = params ? { ...params } : {};
		const requestOpts = { method: "GET" as const, path: "/affiliates", query };
		const response = await this.httpClient.request<{
			data: Affiliate[];
			pagination: OffsetPaginationMeta;
		}>(requestOpts);
		return new OffsetPage(response.data, response.pagination, this.httpClient, requestOpts);
	}

	async retrieve(id: string, params?: AffiliateRetrieveParams): Promise<Affiliate> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Affiliate }>({
			method: "GET",
			path: `/affiliates/${encodeURIComponent(id)}`,
			query,
		});
		return response.data;
	}

	async create(params: AffiliateCreateParams): Promise<Affiliate> {
		const response = await this.httpClient.request<{ data: Affiliate }>({
			method: "POST",
			path: "/affiliates",
			body: params,
		});
		return response.data;
	}

	async update(id: string, params: AffiliateUpdateParams): Promise<Affiliate> {
		const response = await this.httpClient.request<{ data: Affiliate }>({
			method: "PUT",
			path: `/affiliates/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/affiliates/${encodeURIComponent(id)}`,
		});
	}
}
