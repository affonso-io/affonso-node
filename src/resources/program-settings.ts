import type { HttpClient } from "../http.js";

// --- Response Types ---

export type ProgramPlanTier = "launch" | "growth" | "elite" | "enterprise";

export interface ProgramPlan {
	tier: ProgramPlanTier | null;
	postbacks: boolean;
	groups_limit: number | null;
}

export interface ProgramSettings {
	id: string;
	name: string;
	slug: string | null;
	tagline: string | null;
	category: string | null;
	description: string | null;
	website_url: string;
	logo_url: string | null;
	access_mode: "public" | "private" | "invite";
	status: string;
	affiliate_links_enabled: boolean;
	default_referral_parameter: string;
	plan: ProgramPlan;
	created_at: string;
	updated_at: string;
}

// --- Input Types ---

export interface ProgramSettingsUpdateParams {
	name?: string;
	tagline?: string | null;
	category?: string | null;
	description?: string | null;
	website_url?: string;
	logo_url?: string | null;
	access_mode?: "PUBLIC" | "PRIVATE" | "INVITE";
	affiliate_links_enabled?: boolean;
}

// --- Resource ---

export class ProgramSettingsResource {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async retrieve(): Promise<ProgramSettings> {
		const response = await this.httpClient.request<{ data: ProgramSettings }>({
			method: "GET",
			path: "/program",
		});
		return response.data;
	}

	async update(params: ProgramSettingsUpdateParams): Promise<ProgramSettings> {
		const response = await this.httpClient.request<{ data: ProgramSettings }>({
			method: "PATCH",
			path: "/program",
			body: params,
		});
		return response.data;
	}
}
