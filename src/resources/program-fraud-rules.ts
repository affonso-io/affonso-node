import type { HttpClient } from "../http.js";

export type FraudRuleMode = "off" | "detect" | "block";

export interface FraudRules {
	self_referral_mode: FraudRuleMode;
	cross_program_ban_mode: FraudRuleMode;
	duplicate_payout_mode: FraudRuleMode;
	suspicious_email_mode: FraudRuleMode;
	banned_referral_mode: FraudRuleMode;
	paid_traffic_mode: FraudRuleMode;
	blocked_country_mode: FraudRuleMode;
	banned_referral_config: Record<string, unknown> | null;
	blocked_country_config: Record<string, unknown> | null;
	paid_traffic_config: Record<string, unknown> | null;
}

export type FraudRulesUpdateParams = Partial<FraudRules>;

export class ProgramFraudRules {
	constructor(private readonly httpClient: HttpClient) {}

	async retrieve(): Promise<FraudRules> {
		const response = await this.httpClient.request<{ data: FraudRules }>({
			method: "GET",
			path: "/program/fraud-rules",
		});
		return response.data;
	}

	async update(params: FraudRulesUpdateParams): Promise<FraudRules> {
		const response = await this.httpClient.request<{ data: FraudRules }>({
			method: "PATCH",
			path: "/program/fraud-rules",
			body: params,
		});
		return response.data;
	}
}
