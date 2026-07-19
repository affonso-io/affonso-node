import type { HttpClient } from "../http.js";
import type { Commission, CommissionStatus, SalesStatus } from "./commissions.js";

export type ConversionInterval = "monthly" | "yearly";

export interface ConversionCreateParams {
	referral_id?: string;
	referralId?: string;
	click_id?: string;
	clickId?: string;
	affonso_id?: string;
	affonsoId?: string;
	affonso_referral?: string;
	affonsoReferral?: string;
	customer_id?: string;
	external_user_id?: string;
	sale_amount: number;
	sale_amount_currency?: string;
	product_ids?: string[];
	price_ids?: string[];
	interval?: ConversionInterval;
	is_subscription?: boolean;
	external_event_id: string;
	created_at?: string;
	status?: CommissionStatus;
	sales_status?: SalesStatus;
	metadata?: Record<string, unknown>;
}

export interface ConversionRefundParams {
	amount?: number;
	currency?: string;
	reason?: string;
	external_event_id?: string;
	refunded_at?: string;
}

export interface Conversion extends Commission {
	external_event_id: string | null;
	calculation_mode: "auto";
	matched_incentive_id: string | null;
	replayed: boolean;
	source_event_id: string | null;
}

export class Conversions {
	constructor(private readonly httpClient: HttpClient) {}

	async create(params: ConversionCreateParams): Promise<Conversion> {
		const response = await this.httpClient.request<{ data: Conversion }>({
			method: "POST",
			path: "/conversions",
			body: params,
			signed: true,
		});
		return response.data;
	}

	async refund(id: string, params: ConversionRefundParams): Promise<Conversion> {
		const response = await this.httpClient.request<{ data: Conversion }>({
			method: "POST",
			path: `/conversions/${encodeURIComponent(id)}/refund`,
			body: params,
			signed: true,
		});
		return response.data;
	}
}
