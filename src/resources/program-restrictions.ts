import type { HttpClient } from "../http.js";

export interface Restrictions {
	websites: boolean;
	social_marketing: boolean;
	organic_social: boolean;
	email_marketing: boolean;
	mobile_traffic: boolean;
	search_engine_marketing: boolean;
	organic_search: boolean;
	rebrokering: boolean;
	incent: boolean;
	brand_bidding: boolean;
	additional_restrictions: string | null;
}

export type RestrictionsUpdateParams = Partial<Restrictions>;

export class ProgramRestrictions {
	constructor(private readonly httpClient: HttpClient) {}

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
