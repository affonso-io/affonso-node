import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface ProgramSettings {
	id: string;
	name: string;
	tagline: string | null;
	category: string | null;
	description: string | null;
	website_url: string | null;
	logo_url: string | null;
	access_mode: string;
	affiliate_links_enabled: boolean;
	plan: string | null;
	plan_features: Record<string, unknown> | null;
	created_at: string;
}

// --- Input Types ---

export interface ProgramSettingsUpdateParams {
	name?: string;
	tagline?: string | null;
	category?: string | null;
	description?: string | null;
	website_url?: string | null;
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
