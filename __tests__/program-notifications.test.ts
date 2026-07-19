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
	email_type_id: "new_affiliate",
	is_active: true,
	custom_subject: "New affiliate joined",
	custom_body: null,
	type: {
		name: "New affiliate",
		description: "Sent when a new affiliate signs up",
		icon: "user-plus",
		is_customizable: true,
		target_audience: "owner",
	},
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
		expect(notifications[0].email_type_id).toBe("new_affiliate");
	});

	it("update sends PATCH with correct body", async () => {
		const client = createMockClient((url, init) => {
			expect(url).toContain("/program/notifications/notif_1");
			expect(init.method).toBe("PATCH");
			const body = JSON.parse(init.body as string);
			expect(body.is_active).toBe(false);
			expect(body.custom_subject).toBe("Paused");
			return {
				status: 200,
				body: {
					success: true,
					data: { ...NOTIFICATION_FIXTURE, is_active: false },
				},
			};
		});

		const notification = await client.program.notifications.update("notif_1", {
			is_active: false,
			custom_subject: "Paused",
		});
		expect(notification.is_active).toBe(false);
	});
});
