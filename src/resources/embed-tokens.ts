import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface EmbedToken {
	publicToken: string;
	expiresAt: string;
	link: string;
	portalUrl: string;
	partnershipStatus: string | null;
}

// --- Input Types ---

export interface EmbedTokenCreateParams {
	affiliate_id?: string;
	external_user_id?: string;
	email?: string;
	name?: string;
	metadata?: Record<string, unknown>;
}

// --- Resource ---

export class EmbedTokens {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async create(params: EmbedTokenCreateParams): Promise<EmbedToken> {
		const response = await this.httpClient.request<{ data: EmbedToken }>({
			method: "POST",
			path: "/embed/token",
			body: params,
		});
		return response.data;
	}
}
