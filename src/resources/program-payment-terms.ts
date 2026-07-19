import type { HttpClient } from "../http.js";

export type CommissionType = "fixed" | "percentage" | "credits";
export type CommissionTypeInput = "FIXED" | "PERCENTAGE" | "CREDITS";
export type CommissionDuration = "lifetime" | "time_limited" | "payment_limited";
export type PaymentFrequency = "weekly" | "monthly";
export type InvoiceRule = "none" | "owner_provides" | "affiliate_provides" | "self_billing";
export type InvoiceRuleInput = "NONE" | "OWNER_PROVIDES" | "AFFILIATE_PROVIDES" | "SELF_BILLING";

export interface PaymentTerms {
	commission_type: CommissionType;
	commission_rate: number;
	commission_duration: CommissionDuration;
	commissions_limit: number | null;
	commissions_hold_days: number | null;
	payment_threshold: number;
	payment_frequency: PaymentFrequency;
	payment_methods: string[];
	cookie_lifetime: number;
	auto_payout: boolean;
	invoice_rule: InvoiceRule;
	invoice_prefix: string | null;
	require_tax_forms: boolean;
	owner_company_name: string | null;
	owner_address_line_1: string | null;
	owner_address_line_2: string | null;
	owner_city: string | null;
	owner_postal_code: string | null;
	owner_country: string | null;
	owner_vat_id: string | null;
	owner_vat_rate: number | null;
}

export interface PaymentTermsUpdateParams {
	commission_type?: CommissionTypeInput;
	commission_rate?: number;
	commission_duration?: CommissionDuration;
	commissions_limit?: number | null;
	commissions_hold_days?: number | null;
	payment_threshold?: number;
	payment_frequency?: PaymentFrequency;
	payment_methods?: string[];
	cookie_lifetime?: number;
	auto_payout?: boolean;
	invoice_rule?: InvoiceRuleInput;
	invoice_prefix?: string | null;
	require_tax_forms?: boolean;
	owner_company_name?: string | null;
	owner_address_line_1?: string | null;
	owner_address_line_2?: string | null;
	owner_city?: string | null;
	owner_postal_code?: string | null;
	owner_country?: string | null;
	owner_vat_id?: string | null;
	owner_vat_rate?: number | null;
}

export class ProgramPaymentTerms {
	constructor(private readonly httpClient: HttpClient) {}

	async retrieve(): Promise<PaymentTerms | null> {
		const response = await this.httpClient.request<{ data: PaymentTerms | null }>({
			method: "GET",
			path: "/program/payment-terms",
		});
		return response.data;
	}

	async update(params: PaymentTermsUpdateParams): Promise<PaymentTerms> {
		const response = await this.httpClient.request<{ data: PaymentTerms }>({
			method: "PATCH",
			path: "/program/payment-terms",
			body: params,
		});
		return response.data;
	}
}
