import type { HttpClient } from "../http.js";

export interface EmbedToken {
	publicToken: string;
	expiresAt: string;
	link: string;
	portalUrl: string;
	partnershipStatus: string;
}

export interface EmbedPartner {
	email: string;
	name?: string;
	image?: string;
}

export interface EmbedTokenCreateParams {
	partner: EmbedPartner;
	groupId?: string;
	externalUserId?: string;
	metadata?: Record<string, unknown>;
}

export class EmbedTokens {
	constructor(private readonly httpClient: HttpClient) {}

	async create(params: EmbedTokenCreateParams): Promise<EmbedToken> {
		const response = await this.httpClient.request<{ data: EmbedToken }>({
			method: "POST",
			path: "/embed/token",
			body: params,
		});
		return response.data;
	}
}
