import type { HttpClient } from "../http.js";

export type TrackingTemplateMacro =
	| "{tracking_id}"
	| "{affiliate_id}"
	| "{program_id}"
	| "{program_slug}"
	| "{affonso_id}"
	| "{program_name}"
	| "{affiliate_name}"
	| "{group_id}"
	| "{group_name}"
	| "{timestamp}"
	| "{randint}";

export type TrackingTemplateEntry =
	| { key: string; value: string; type: "literal" }
	| { key: string; value: TrackingTemplateMacro; type: "macro" };

export interface TrackingSettings {
	default_referral_parameter: string;
	enabled_referral_parameters: string[];
	email_tracking_enabled: boolean;
	name_tracking_enabled: boolean;
	postbacks_enabled: boolean;
	append_affonso_id_enabled: boolean;
	tracking_template_enabled: boolean;
	tracking_template: TrackingTemplateEntry[] | null;
}

export interface TrackingSettingsUpdateParams {
	default_referral_parameter?: string;
	enabled_referral_parameters?: string[];
	email_tracking_enabled?: boolean;
	name_tracking_enabled?: boolean;
	postbacks_enabled?: boolean;
	append_affonso_id_enabled?: boolean;
	tracking_template_enabled?: boolean;
	tracking_template?: TrackingTemplateEntry[] | null;
}

export class ProgramTracking {
	constructor(private readonly httpClient: HttpClient) {}

	async retrieve(): Promise<TrackingSettings> {
		const response = await this.httpClient.request<{ data: TrackingSettings }>({
			method: "GET",
			path: "/program/tracking",
		});
		return response.data;
	}

	async update(params: TrackingSettingsUpdateParams): Promise<TrackingSettings> {
		const response = await this.httpClient.request<{ data: TrackingSettings }>({
			method: "PATCH",
			path: "/program/tracking",
			body: params,
		});
		return response.data;
	}
}
