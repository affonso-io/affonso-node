import type { HttpClient } from "../http.js";

// --- Response Types ---

export type FraudRuleMode = "off" | "detect" | "block";

export interface FraudRuleConfig {
	threshold: number | null;
	window_hours: number | null;
}

export interface FraudRules {
	self_referral: FraudRuleMode;
	self_referral_config: FraudRuleConfig | null;
	duplicate_ip: FraudRuleMode;
	duplicate_ip_config: FraudRuleConfig | null;
	vpn_proxy: FraudRuleMode;
	vpn_proxy_config: FraudRuleConfig | null;
	suspicious_conversion: FraudRuleMode;
	suspicious_conversion_config: FraudRuleConfig | null;
}

// --- Input Types ---

export interface FraudRulesUpdateParams {
	self_referral?: FraudRuleMode;
	self_referral_config?: FraudRuleConfig | null;
	duplicate_ip?: FraudRuleMode;
	duplicate_ip_config?: FraudRuleConfig | null;
	vpn_proxy?: FraudRuleMode;
	vpn_proxy_config?: FraudRuleConfig | null;
	suspicious_conversion?: FraudRuleMode;
	suspicious_conversion_config?: FraudRuleConfig | null;
}

// --- Resource ---

export class ProgramFraudRules {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

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
