import type { HttpClient } from "../http.js";

// --- Response Types ---

export type CommissionType = "percentage" | "fixed";
export type CommissionDuration = "forever" | "once" | "first_month" | "custom";
export type PaymentFrequency = "monthly" | "biweekly" | "weekly";

export interface PaymentTerms {
	commission_type: string;
	commission_rate: number;
	commission_duration: string;
	commission_duration_value: number | null;
	payment_threshold: number;
	payment_frequency: string;
	cookie_lifetime: number;
	auto_payout: boolean;
	invoice_required: boolean;
	invoice_company_name: string | null;
	invoice_address: string | null;
	invoice_city: string | null;
	invoice_state: string | null;
	invoice_postal_code: string | null;
	invoice_country: string | null;
	invoice_vat_id: string | null;
	owner_first_name: string | null;
	owner_last_name: string | null;
	owner_email: string | null;
}

// --- Input Types ---

export interface PaymentTermsUpdateParams {
	commission_type?: CommissionType;
	commission_rate?: number;
	commission_duration?: CommissionDuration;
	commission_duration_value?: number | null;
	payment_threshold?: number;
	payment_frequency?: PaymentFrequency;
	cookie_lifetime?: number;
	auto_payout?: boolean;
	invoice_required?: boolean;
	invoice_company_name?: string | null;
	invoice_address?: string | null;
	invoice_city?: string | null;
	invoice_state?: string | null;
	invoice_postal_code?: string | null;
	invoice_country?: string | null;
	invoice_vat_id?: string | null;
	owner_first_name?: string | null;
	owner_last_name?: string | null;
	owner_email?: string | null;
}

// --- Resource ---

export class ProgramPaymentTerms {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async retrieve(): Promise<PaymentTerms> {
		const response = await this.httpClient.request<{ data: PaymentTerms }>({
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
