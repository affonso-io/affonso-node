import { describe, expect, it } from "vitest";
import {
	AffonsoError,
	AuthenticationError,
	ConnectionError,
	DuplicateError,
	InternalError,
	NotFoundError,
	PermissionError,
	RateLimitError,
	ValidationError,
	errorFromResponse,
} from "../src/errors.js";

describe("Error classes", () => {
	it("AffonsoError has correct properties", () => {
		const err = new AffonsoError("test", { status: 500, code: "ERR" });
		expect(err.message).toBe("test");
		expect(err.status).toBe(500);
		expect(err.code).toBe("ERR");
		expect(err).toBeInstanceOf(Error);
	});

	it("AuthenticationError has status 401", () => {
		const err = new AuthenticationError("unauthorized");
		expect(err.status).toBe(401);
		expect(err.name).toBe("AuthenticationError");
	});

	it("ValidationError has details", () => {
		const details = [{ field: "email", message: "invalid" }];
		const err = new ValidationError("bad request", details);
		expect(err.status).toBe(400);
		expect(err.details).toEqual(details);
	});

	it("RateLimitError has retryAfter", () => {
		const err = new RateLimitError("slow down", 60);
		expect(err.status).toBe(429);
		expect(err.retryAfter).toBe(60);
	});

	it("ConnectionError has no status", () => {
		const err = new ConnectionError("timeout");
		expect(err.status).toBeUndefined();
	});
});

describe("errorFromResponse", () => {
	const makeHeaders = (h: Record<string, string> = {}) => new Headers(h);

	it("maps 401 to AuthenticationError", () => {
		const err = errorFromResponse(
			401,
			{ error: { code: "UNAUTHORIZED", message: "bad key" } },
			makeHeaders(),
		);
		expect(err).toBeInstanceOf(AuthenticationError);
		expect(err.message).toBe("bad key");
	});

	it("maps 403 to PermissionError", () => {
		const err = errorFromResponse(
			403,
			{ error: { code: "FORBIDDEN", message: "denied" } },
			makeHeaders(),
		);
		expect(err).toBeInstanceOf(PermissionError);
	});

	it("maps 404 to NotFoundError", () => {
		const err = errorFromResponse(
			404,
			{ error: { code: "NOT_FOUND", message: "gone" } },
			makeHeaders(),
		);
		expect(err).toBeInstanceOf(NotFoundError);
	});

	it("maps 400 VALIDATION_ERROR to ValidationError with details", () => {
		const details = [{ field: "email" }];
		const err = errorFromResponse(
			400,
			{ error: { code: "VALIDATION_ERROR", message: "invalid", details } },
			makeHeaders(),
		);
		expect(err).toBeInstanceOf(ValidationError);
		expect((err as ValidationError).details).toEqual(details);
	});

	it("maps 409 to DuplicateError", () => {
		const err = errorFromResponse(
			409,
			{ error: { code: "DUPLICATE_ERROR", message: "exists" } },
			makeHeaders(),
		);
		expect(err).toBeInstanceOf(DuplicateError);
	});

	it("maps 429 to RateLimitError with retryAfter from header", () => {
		const resetTime = String(Math.floor(Date.now() / 1000) + 60);
		const err = errorFromResponse(
			429,
			{ error: { code: "RATE_LIMIT_EXCEEDED", message: "slow" } },
			makeHeaders({ "x-ratelimit-reset": resetTime }),
		);
		expect(err).toBeInstanceOf(RateLimitError);
		expect((err as RateLimitError).retryAfter).toBe(Number(resetTime));
	});

	it("maps 5xx to InternalError", () => {
		const err = errorFromResponse(500, { error: { message: "boom" } }, makeHeaders());
		expect(err).toBeInstanceOf(InternalError);
	});

	it("falls back to AffonsoError for unknown status", () => {
		const err = errorFromResponse(418, { error: { message: "teapot" } }, makeHeaders());
		expect(err).toBeInstanceOf(AffonsoError);
		expect(err.status).toBe(418);
	});
});
