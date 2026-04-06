export class AffonsoError extends Error {
	readonly status: number | undefined;
	readonly code: string | undefined;
	readonly field: string | undefined;
	readonly details: unknown[] | undefined;
	readonly headers: Headers | undefined;

	constructor(
		message: string,
		opts?: {
			status?: number;
			code?: string;
			field?: string;
			details?: unknown[];
			headers?: Headers;
		},
	) {
		super(message);
		this.name = "AffonsoError";
		this.status = opts?.status;
		this.code = opts?.code;
		this.field = opts?.field;
		this.details = opts?.details;
		this.headers = opts?.headers;
	}
}

export class AuthenticationError extends AffonsoError {
	constructor(message: string, opts?: ConstructorParameters<typeof AffonsoError>[1]) {
		super(message, { ...opts, status: 401 });
		this.name = "AuthenticationError";
	}
}

export class PermissionError extends AffonsoError {
	constructor(message: string, opts?: ConstructorParameters<typeof AffonsoError>[1]) {
		super(message, { ...opts, status: 403 });
		this.name = "PermissionError";
	}
}

export class NotFoundError extends AffonsoError {
	constructor(message: string, opts?: ConstructorParameters<typeof AffonsoError>[1]) {
		super(message, { ...opts, status: 404 });
		this.name = "NotFoundError";
	}
}

export class ValidationError extends AffonsoError {
	override readonly details: unknown[];

	constructor(
		message: string,
		details: unknown[],
		opts?: ConstructorParameters<typeof AffonsoError>[1],
	) {
		super(message, { ...opts, status: 400, details });
		this.name = "ValidationError";
		this.details = details;
	}
}

export class DuplicateError extends AffonsoError {
	constructor(message: string, opts?: ConstructorParameters<typeof AffonsoError>[1]) {
		super(message, { ...opts, status: 409 });
		this.name = "DuplicateError";
	}
}

export class RateLimitError extends AffonsoError {
	readonly retryAfter: number | undefined;

	constructor(
		message: string,
		retryAfter?: number,
		opts?: ConstructorParameters<typeof AffonsoError>[1],
	) {
		super(message, { ...opts, status: 429 });
		this.name = "RateLimitError";
		this.retryAfter = retryAfter;
	}
}

export class InternalError extends AffonsoError {
	constructor(message: string, opts?: ConstructorParameters<typeof AffonsoError>[1]) {
		super(message, opts);
		this.name = "InternalError";
	}
}

export class ConnectionError extends AffonsoError {
	constructor(message: string) {
		super(message, { status: undefined });
		this.name = "ConnectionError";
	}
}

export function errorFromResponse(
	status: number,
	body: { error?: { code?: string; message?: string; field?: string; details?: unknown[] } },
	headers: Headers,
): AffonsoError {
	const err = body.error ?? {};
	const message = err.message ?? `Request failed with status ${status}`;
	const code = err.code;
	const opts = { status, code, field: err.field, details: err.details, headers };

	if (code === "VALIDATION_ERROR" || (!code && status === 400)) {
		return new ValidationError(message, err.details ?? [], opts);
	}
	if (code === "RATE_LIMIT_EXCEEDED" || (!code && status === 429)) {
		const retry = headers.get("x-ratelimit-reset");
		return new RateLimitError(message, retry ? Number(retry) : undefined, opts);
	}
	if (code === "UNAUTHORIZED" || (!code && status === 401)) {
		return new AuthenticationError(message, opts);
	}
	if (code === "FORBIDDEN" || (!code && status === 403)) {
		return new PermissionError(message, opts);
	}
	if (code === "NOT_FOUND" || (!code && status === 404)) {
		return new NotFoundError(message, opts);
	}
	if (code === "DUPLICATE_ERROR" || (!code && status === 409)) {
		return new DuplicateError(message, opts);
	}
	if (status >= 500) return new InternalError(message, opts);

	return new AffonsoError(message, opts);
}
