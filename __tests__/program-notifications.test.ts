import { describe, expect, it, vi } from "vitest";
import { Affonso } from "../src/client.js";

function createMockClient(
	handler: (url: string, init: RequestInit) => { status: number; body: unknown },
) {
	const fetchFn = vi.fn(async (url: string, init: RequestInit) => {
		const result = handler(url, init);
		return {
			ok: result.status >= 200 && result.status < 300,
			status: result.status,
			headers: new Headers(),
			json: async () => result.body,
		} as Response;
	});

	return new Affonso("sk_test_123", {
		baseUrl: "https://api.test.io/v1",
		fetch: fetchFn,
		maxRetries: 0,
	});
}

const NOTIFICATION_FIXTURE = {
	id: "notif_1",
	email_type: "new_affiliate",
	subject: "New affiliate joined",
	enabled: true,
	recipient: "owner",
	description: "Sent when a new affiliate signs up",
};

describe("Program Notifications", () => {
	it("list returns array of notifications", async () => {
		const client = createMockClient((url) => {
			expect(url).toContain("/program/notifications");
			return {
				status: 200,
				body: { success: true, data: [NOTIFICATION_FIXTURE] },
			};
		});

		const notifications = await client.program.notifications.list();
		expect(notifications).toHaveLength(1);
		expect(notifications[0].email_type).toBe("new_affiliate");
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((url, init) => {
			expect(url).toContain("/program/notifications/notif_1");
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.enabled).toBe(false);
			return {
				status: 200,
				body: {
					success: true,
					data: { ...NOTIFICATION_FIXTURE, enabled: false },
				},
			};
		});

		const notification = await client.program.notifications.update("notif_1", {
			enabled: false,
		});
		expect(notification.enabled).toBe(false);
	});
});
