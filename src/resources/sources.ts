import type { HttpClient } from "../http.js";
import type { EventResult } from "./events.js";

export type SourceAdapter = "custom" | "segment_webhook";
export type SourceSigningSecrets = Partial<Record<SourceAdapter | "segment", string>>;

export interface SegmentTrackParams {
	type: "track";
	event: string;
	messageId: string;
	userId?: string;
	anonymousId?: string;
	timestamp?: string;
	properties?: Record<string, unknown>;
	context?: Record<string, unknown>;
}

export class Sources {
	constructor(private readonly httpClient: HttpClient) {}

	async ingest(source: SourceAdapter, params: Record<string, unknown>): Promise<EventResult> {
		const response = await this.httpClient.request<{ data: EventResult }>({
			method: "POST",
			path: `/sources/${encodeURIComponent(source)}/events`,
			body: params,
			signed: true,
			signingSecret: this.httpClient.getSourceSigningSecret(source),
		});
		return response.data;
	}

	async ingestSegment(params: SegmentTrackParams): Promise<EventResult> {
		const response = await this.httpClient.request<{ data: EventResult }>({
			method: "POST",
			path: "/sources/segment/events",
			body: params,
			signed: true,
			signingSecret: this.httpClient.getSourceSigningSecret("segment"),
		});
		return response.data;
	}
}
