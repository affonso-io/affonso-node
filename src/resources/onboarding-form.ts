import type { HttpClient } from "../http.js";
import type { DeleteResponse } from "../types.js";

export type OnboardingQuestionType =
	| "single_choice"
	| "multiple_choice"
	| "text_input"
	| "textarea";

export interface OnboardingFormQuestion {
	id: string;
	question: string;
	type: OnboardingQuestionType;
	is_required: boolean;
	options: string[];
	order: number;
}

export interface OnboardingQuestionInput {
	id?: string;
	question: string;
	type: OnboardingQuestionType;
	is_required?: boolean;
	options?: string[];
	order: number;
}

export interface OnboardingForm {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	questions: OnboardingFormQuestion[];
}

export interface OnboardingFormCreateParams {
	name: string;
	description?: string | null;
	questions: OnboardingQuestionInput[];
}

export interface OnboardingFormUpdateParams {
	name?: string;
	description?: string | null;
	questions?: OnboardingQuestionInput[];
}

export class OnboardingForms {
	constructor(private readonly httpClient: HttpClient) {}

	async retrieve(): Promise<OnboardingForm> {
		const response = await this.httpClient.request<{ data: OnboardingForm }>({
			method: "GET",
			path: "/onboarding-form",
		});
		return response.data;
	}

	async create(params: OnboardingFormCreateParams): Promise<OnboardingForm> {
		const response = await this.httpClient.request<{ data: OnboardingForm }>({
			method: "POST",
			path: "/onboarding-form",
			body: params,
		});
		return response.data;
	}

	async update(params: OnboardingFormUpdateParams): Promise<OnboardingForm> {
		const response = await this.httpClient.request<{ data: OnboardingForm }>({
			method: "PATCH",
			path: "/onboarding-form",
			body: params,
		});
		return response.data;
	}

	async del(): Promise<DeleteResponse> {
		return this.httpClient.request({ method: "DELETE", path: "/onboarding-form" });
	}
}
