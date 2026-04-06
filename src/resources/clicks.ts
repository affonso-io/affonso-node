import type { HttpClient } from "../http.js";

// --- Response Types (from OpenAPI Click schema) ---

export interface Click {
	id: string;
	tracking_id: string;
	program_id: string;
	created_at: string;
}

// --- Input Types (from Zod createClickSchema — camelCase request body) ---

export interface ClickCreateParams {
	programId: string;
	trackingId: string;
	createdAt?: string;
	sub1?: string;
	sub2?: string;
	sub3?: string;
	sub4?: string;
	sub5?: string;
	referrer?: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	utmTerm?: string;
	utmContent?: string;
	userAgent?: string;
	ip?: string;
	gclid?: string;
	fbclid?: string;
	msclkid?: string;
	ttclid?: string;
}

// --- Resource ---

export class Clicks {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async create(params: ClickCreateParams): Promise<Click> {
		const response = await this.httpClient.request<{ data: Click }>({
			method: "POST",
			path: "/clicks",
			body: params,
		});
		return response.data;
	}
}
