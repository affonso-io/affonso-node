import type { HttpClient } from "../http.js";
import type { Referral } from "./referrals.js";

export interface SignupCreateParams {
	click_id: string;
	email?: string;
	external_user_id?: string;
	name?: string;
}

export class Signups {
	constructor(private readonly httpClient: HttpClient) {}

	async create(params: SignupCreateParams): Promise<Referral> {
		const response = await this.httpClient.request<{ data: Referral }>({
			method: "POST",
			path: "/signups",
			body: params,
		});
		return response.data;
	}
}
