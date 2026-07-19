import type { HttpClient } from "../http.js";

export interface PortalSettings {
	single_program_portal: boolean;
	hide_branding: boolean;
	hide_details: boolean;
	primary_color: string | null;
	secondary_color: string | null;
	show_leaderboard: boolean;
	terms_conditions_status: boolean;
	terms_conditions_value: string | null;
	privacy_policy_status: boolean;
	privacy_policy_value: string | null;
	support_email_status: boolean;
	support_email_value: string | null;
	custom_texts: Record<string, unknown> | null;
}

export type PortalSettingsUpdateParams = Partial<PortalSettings>;

export class ProgramPortal {
	constructor(private readonly httpClient: HttpClient) {}

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
