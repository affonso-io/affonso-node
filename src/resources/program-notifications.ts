import type { HttpClient } from "../http.js";

export interface NotificationType {
	name: string;
	description: string;
	icon: string;
	is_customizable: boolean;
	target_audience: string;
}

export interface Notification {
	id: string | null;
	email_type_id: string;
	is_active: boolean;
	custom_subject: string | null;
	custom_body: string | null;
	type: NotificationType;
}

export interface NotificationUpdateParams {
	is_active?: boolean;
	custom_subject?: string | null;
	custom_body?: string | null;
}

export class ProgramNotifications {
	constructor(private readonly httpClient: HttpClient) {}

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
