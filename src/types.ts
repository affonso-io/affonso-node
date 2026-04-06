export interface OffsetPaginationMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
	has_next_page: boolean;
	has_prev_page: boolean;
}

export interface OffsetPaginatedResponse<T> {
	success: true;
	data: T[];
	pagination: OffsetPaginationMeta;
}

export interface CursorPaginatedResponse<T> {
	success: true;
	data: T[];
	has_more: boolean;
}

export interface SingleResponse<T> {
	success: true;
	data: T;
}

export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		field?: string;
		details?: unknown[];
	};
}

export type ApiResponse<T> = SingleResponse<T> | ErrorResponse;

export interface OffsetPaginationParams {
	page?: number;
	limit?: number;
}

export interface CursorPaginationParams {
	limit?: number;
	starting_after?: string;
	ending_before?: string;
}

export interface DeleteResponse {
	success: true;
	message: string;
}

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
	method: RequestMethod;
	path: string;
	query?: Record<string, unknown>;
	body?: unknown;
}
