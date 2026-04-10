import type { HttpClient } from "../http.js";

// --- Response Types ---

export interface Notification {
	id: string;
	email_type: string;
	subject: string;
	enabled: boolean;
	recipient: string;
	description: string | null;
}

// --- Input Types ---

export interface NotificationUpdateParams {
	subject?: string;
	enabled?: boolean;
}

// --- Resource ---

export class ProgramNotifications {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(): Promise<Notification[]> {
		const response = await this.httpClient.request<{ data: Notification[] }>({
			method: "GET",
			path: "/program/notifications",
		});
		return response.data;
	}

	async update(emailTypeId: string, params: NotificationUpdateParams): Promise<Notification> {
		const response = await this.httpClient.request<{ data: Notification }>({
			method: "PATCH",
			path: `/program/notifications/${encodeURIComponent(emailTypeId)}`,
			body: params,
		});
		return response.data;
	}
}
