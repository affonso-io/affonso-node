import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface Restrictions {
	websites: boolean;
	social_marketing: boolean;
	organic_social: boolean;
	email_marketing: boolean;
	paid_ads: boolean;
	content_marketing: boolean;
	coupon_sites: boolean;
	review_sites: boolean;
	incentivized_traffic: boolean;
	trademark_bidding: boolean;
}

// --- Input Types ---

export interface RestrictionsUpdateParams {
	websites?: boolean;
	social_marketing?: boolean;
	organic_social?: boolean;
	email_marketing?: boolean;
	paid_ads?: boolean;
	content_marketing?: boolean;
	coupon_sites?: boolean;
	review_sites?: boolean;
	incentivized_traffic?: boolean;
	trademark_bidding?: boolean;
}

// --- Resource ---

export class ProgramRestrictions {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async retrieve(): Promise<Restrictions> {
		const response = await this.httpClient.request<{ data: Restrictions }>({
			method: "GET",
			path: "/program/restrictions",
		});
		return response.data;
	}

	async update(params: RestrictionsUpdateParams): Promise<Restrictions> {
		const response = await this.httpClient.request<{ data: Restrictions }>({
			method: "PATCH",
			path: "/program/restrictions",
			body: params,
		});
		return response.data;
	}
}
