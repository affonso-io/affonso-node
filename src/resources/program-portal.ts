import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface PortalCustomTexts {
	welcome_title: string | null;
	welcome_description: string | null;
	dashboard_message: string | null;
}

export interface PortalSettings {
	primary_color: string | null;
	accent_color: string | null;
	logo_url: string | null;
	favicon_url: string | null;
	custom_domain: string | null;
	terms_url: string | null;
	privacy_url: string | null;
	custom_texts: PortalCustomTexts | null;
	onboarding_enabled: boolean;
	resources_enabled: boolean;
}

// --- Input Types ---

export interface PortalSettingsUpdateParams {
	primary_color?: string | null;
	accent_color?: string | null;
	logo_url?: string | null;
	favicon_url?: string | null;
	custom_domain?: string | null;
	terms_url?: string | null;
	privacy_url?: string | null;
	custom_texts?: Partial<PortalCustomTexts> | null;
	onboarding_enabled?: boolean;
	resources_enabled?: boolean;
}

// --- Resource ---

export class ProgramPortal {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async retrieve(): Promise<PortalSettings> {
		const response = await this.httpClient.request<{ data: PortalSettings }>({
			method: "GET",
			path: "/program/portal",
		});
		return response.data;
	}

	async update(params: PortalSettingsUpdateParams): Promise<PortalSettings> {
		const response = await this.httpClient.request<{ data: PortalSettings }>({
			method: "PATCH",
			path: "/program/portal",
			body: params,
		});
		return response.data;
	}
}
