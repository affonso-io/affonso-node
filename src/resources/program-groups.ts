import type { HttpClient } from "../http.js";
import type { DeleteResponse } from "../types.js";

// --- Response Types ---

export interface GroupIncentive {
	id: string;
	name: string;
	type: string;
	amount: number;
	is_percentage: boolean;
	apply_to: string;
	product_ids: string[];
	approval_type: string;
	hold_period_days: number | null;
	incentive_length: string;
	length_value: number | null;
	variable_commission: boolean;
	variable_config: unknown;
}

export interface Group {
	id: string;
	name: string;
	description: string | null;
	is_default: boolean;
	affiliate_count: number;
	created_at: string;
	// Expandable fields
	incentives?: GroupIncentive[];
	multi_level_incentives?: unknown[];
}

// --- Query/Input Types ---

export type GroupExpandField = "incentives" | "multi_level_incentives";

export interface GroupListParams {
	expand?: string;
}

export interface GroupRetrieveParams {
	expand?: string;
}

export interface GroupCreateParams {
	name: string;
	description?: string | null;
	is_default?: boolean;
}

export interface GroupUpdateParams {
	name?: string;
	description?: string | null;
	is_default?: boolean;
}

// --- Resource ---

export class ProgramGroups {
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	async list(params?: GroupListParams): Promise<Group[]> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Group[] }>({
			method: "GET",
			path: "/program/groups",
			query,
		});
		return response.data;
	}

	async retrieve(id: string, params?: GroupRetrieveParams): Promise<Group> {
		const query = params ? { ...params } : undefined;
		const response = await this.httpClient.request<{ data: Group }>({
			method: "GET",
			path: `/program/groups/${encodeURIComponent(id)}`,
			query,
		});
		return response.data;
	}

	async create(params: GroupCreateParams): Promise<Group> {
		const response = await this.httpClient.request<{ data: Group }>({
			method: "POST",
			path: "/program/groups",
			body: params,
		});
		return response.data;
	}

	async update(id: string, params: GroupUpdateParams): Promise<Group> {
		const response = await this.httpClient.request<{ data: Group }>({
			method: "PATCH",
			path: `/program/groups/${encodeURIComponent(id)}`,
			body: params,
		});
		return response.data;
	}

	async del(id: string): Promise<DeleteResponse> {
		return this.httpClient.request<DeleteResponse>({
			method: "DELETE",
			path: `/program/groups/${encodeURIComponent(id)}`,
		});
	}
}
