import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

const OPENAPI_OPERATIONS = [
	"GET /affiliates",
	"POST /affiliates",
	"GET /affiliates/{id}",
	"PUT /affiliates/{id}",
	"DELETE /affiliates/{id}",
	"POST /affiliates/{id}/portal-token",
	"GET /referrals",
	"POST /referrals",
	"GET /referrals/{id}",
	"PUT /referrals/{id}",
	"DELETE /referrals/{id}",
	"POST /track",
	"POST /clicks",
	"POST /signups",
	"GET /commissions",
	"POST /commissions",
	"POST /conversions",
	"POST /conversions/{id}/refund",
	"POST /events",
	"POST /sources/segment/events",
	"POST /sources/{source}/events",
	"GET /commissions/{id}",
	"PUT /commissions/{id}",
	"DELETE /commissions/{id}",
	"GET /payouts",
	"GET /payouts/{id}",
	"PUT /payouts/{id}",
	"POST /embed/token",
	"GET /coupons",
	"POST /coupons",
	"GET /coupons/{id}",
	"DELETE /coupons/{id}",
	"GET /marketplace",
	"GET /marketplace/{id}",
	"GET /program",
	"PATCH /program",
	"GET /program/payment-terms",
	"PATCH /program/payment-terms",
	"GET /program/tracking",
	"PATCH /program/tracking",
	"GET /program/restrictions",
	"PATCH /program/restrictions",
	"GET /program/groups",
	"POST /program/groups",
	"GET /program/groups/{id}",
	"PATCH /program/groups/{id}",
	"DELETE /program/groups/{id}",
	"GET /program/creatives",
	"POST /program/creatives",
	"GET /program/creatives/{id}",
	"PATCH /program/creatives/{id}",
	"DELETE /program/creatives/{id}",
	"GET /program/notifications",
	"PATCH /program/notifications/{emailTypeId}",
	"GET /program/portal",
	"PATCH /program/portal",
	"GET /program/fraud-rules",
	"PATCH /program/fraud-rules",
	"GET /onboarding-form",
	"POST /onboarding-form",
	"PATCH /onboarding-form",
	"DELETE /onboarding-form",
	"GET /affiliates/{id}/onboarding-responses",
	"POST /affiliates/{id}/onboarding-responses",
] as const;

type OpenApiOperation = (typeof OPENAPI_OPERATIONS)[number];

const SDK_OPERATION_BY_ENDPOINT: Record<OpenApiOperation, string> = {
	"GET /affiliates": "affiliates.list",
	"POST /affiliates": "affiliates.create",
	"GET /affiliates/{id}": "affiliates.retrieve",
	"PUT /affiliates/{id}": "affiliates.update",
	"DELETE /affiliates/{id}": "affiliates.del",
	"POST /affiliates/{id}/portal-token": "affiliates.createPortalToken",
	"GET /referrals": "referrals.list",
	"POST /referrals": "referrals.create",
	"GET /referrals/{id}": "referrals.retrieve",
	"PUT /referrals/{id}": "referrals.update",
	"DELETE /referrals/{id}": "referrals.del",
	"POST /track": "tracking.track",
	"POST /clicks": "clicks.create",
	"POST /signups": "signups.create",
	"GET /commissions": "commissions.list",
	"POST /commissions": "commissions.create",
	"POST /conversions": "conversions.create",
	"POST /conversions/{id}/refund": "conversions.refund",
	"POST /events": "events.create",
	"POST /sources/segment/events": "sources.ingestSegment",
	"POST /sources/{source}/events": "sources.ingest",
	"GET /commissions/{id}": "commissions.retrieve",
	"PUT /commissions/{id}": "commissions.update",
	"DELETE /commissions/{id}": "commissions.del",
	"GET /payouts": "payouts.list",
	"GET /payouts/{id}": "payouts.retrieve",
	"PUT /payouts/{id}": "payouts.update",
	"POST /embed/token": "embedTokens.create",
	"GET /coupons": "coupons.list",
	"POST /coupons": "coupons.create",
	"GET /coupons/{id}": "coupons.retrieve",
	"DELETE /coupons/{id}": "coupons.del",
	"GET /marketplace": "marketplace.list",
	"GET /marketplace/{id}": "marketplace.retrieve",
	"GET /program": "program.retrieve",
	"PATCH /program": "program.update",
	"GET /program/payment-terms": "program.paymentTerms.retrieve",
	"PATCH /program/payment-terms": "program.paymentTerms.update",
	"GET /program/tracking": "program.tracking.retrieve",
	"PATCH /program/tracking": "program.tracking.update",
	"GET /program/restrictions": "program.restrictions.retrieve",
	"PATCH /program/restrictions": "program.restrictions.update",
	"GET /program/groups": "program.groups.list",
	"POST /program/groups": "program.groups.create",
	"GET /program/groups/{id}": "program.groups.retrieve",
	"PATCH /program/groups/{id}": "program.groups.update",
	"DELETE /program/groups/{id}": "program.groups.del",
	"GET /program/creatives": "program.creatives.list",
	"POST /program/creatives": "program.creatives.create",
	"GET /program/creatives/{id}": "program.creatives.retrieve",
	"PATCH /program/creatives/{id}": "program.creatives.update",
	"DELETE /program/creatives/{id}": "program.creatives.del",
	"GET /program/notifications": "program.notifications.list",
	"PATCH /program/notifications/{emailTypeId}": "program.notifications.update",
	"GET /program/portal": "program.portal.retrieve",
	"PATCH /program/portal": "program.portal.update",
	"GET /program/fraud-rules": "program.fraudRules.retrieve",
	"PATCH /program/fraud-rules": "program.fraudRules.update",
	"GET /onboarding-form": "onboardingForm.retrieve",
	"POST /onboarding-form": "onboardingForm.create",
	"PATCH /onboarding-form": "onboardingForm.update",
	"DELETE /onboarding-form": "onboardingForm.del",
	"GET /affiliates/{id}/onboarding-responses": "affiliates.retrieveOnboardingResponses",
	"POST /affiliates/{id}/onboarding-responses": "affiliates.submitOnboardingResponses",
};

function resolveMethod(client: Affonso, methodPath: string): unknown {
	let value: unknown = client;
	for (const part of methodPath.split(".")) {
		value = (value as Record<string, unknown>)[part];
	}
	return value;
}

describe("OpenAPI operation coverage", () => {
	it("maps all 64 documented operations exactly once", () => {
		expect(OPENAPI_OPERATIONS).toHaveLength(64);
		expect(new Set(OPENAPI_OPERATIONS).size).toBe(64);
		expect(Object.keys(SDK_OPERATION_BY_ENDPOINT).sort()).toEqual([...OPENAPI_OPERATIONS].sort());
	});

	it("maps every operation to a public SDK method", () => {
		const client = new Affonso("sk_coverage", { fetch: vi.fn() });
		const missing = Object.entries(SDK_OPERATION_BY_ENDPOINT)
			.filter(([, methodPath]) => typeof resolveMethod(client, methodPath) !== "function")
			.map(([operation, methodPath]) => `${operation} -> ${methodPath}`);

		expect(missing, `Missing SDK methods:\n${missing.join("\n")}`).toEqual([]);
	});
});
