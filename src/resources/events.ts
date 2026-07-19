import type { HttpClient } from "../http.js";
import type { Conversion, ConversionInterval } from "./conversions.js";

export type EventType = "conversion" | "lead" | "trial" | "milestone";

export interface EventCreateParams {
	event_name: string;
	event_type?: EventType;
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
	occurred_at?: string;
	external_event_id?: string;
	sale_amount?: number;
	sale_amount_currency?: string;
	product_ids?: string[];
	price_ids?: string[];
	interval?: ConversionInterval;
	is_subscription?: boolean;
	metadata?: Record<string, unknown>;
}

export interface S2SEvent {
	referral_id: string;
	transaction_id: string | null;
	event_name: string;
	event_type: string;
	external_event_id: string | null;
	action: string;
	referral_status: string;
	replayed: boolean;
	source_event_id: string | null;
}

export type EventResult = S2SEvent | Conversion;

export class Events {
	constructor(private readonly httpClient: HttpClient) {}

	async create(params: EventCreateParams): Promise<EventResult> {
		const response = await this.httpClient.request<{ data: EventResult }>({
			method: "POST",
			path: "/events",
			body: params,
			signed: true,
		});
		return response.data;
	}
}
