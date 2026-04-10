import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface TrackingPostback {
	url: string;
	event: string;
	enabled: boolean;
}

export interface TrackingSettings {
	default_referral_parameter: string;
	enabled_referral_parameters: string[];
	track_email: boolean;
	track_name: boolean;
	postbacks: TrackingPostback[];
}

// --- Input Types ---

export interface TrackingSettingsUpdateParams {
	default_referral_parameter?: string;
	enabled_referral_parameters?: string[];
	track_email?: boolean;
	track_name?: boolean;
	postbacks?: TrackingPostback[];
}

// --- Resource ---

export class ProgramTracking {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

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
