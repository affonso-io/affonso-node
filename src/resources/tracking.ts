import type { HttpClient } from "../http.js";

export interface TrackingTrackParams {
	programId: string;
	trackingId?: string;
	sub1?: string | null;
	sub2?: string | null;
	sub3?: string | null;
	sub4?: string | null;
	sub5?: string | null;
	referrer?: string;
	userAgent?: string;
	utmSource?: string | null;
	utmMedium?: string | null;
	utmCampaign?: string | null;
	utmTerm?: string | null;
	utmContent?: string | null;
	gclid?: string | null;
	gbraid?: string | null;
	wbraid?: string | null;
	gadSource?: string | null;
	utmAgid?: string | null;
	gadCampaignid?: string | null;
	utmAdid?: string | null;
	fbclid?: string | null;
	fbadid?: string | null;
	fbgid?: string | null;
	igshid?: string | null;
	msclkid?: string | null;
	ttclid?: string | null;
	li_fat_id?: string | null;
	twclid?: string | null;
	epik?: string | null;
	ScCid?: string | null;
	rdt_cid?: string | null;
	upgradeClickId?: string;
	hasConsent?: boolean;
}

export interface TrackingDiscount {
	amount: number;
	type: string;
	maxDuration: string | null;
	couponId: string | null;
	promoCode: string;
}

export interface TrackingResult {
	cid: string;
	data: {
		discount: TrackingDiscount | null;
		affiliateCoupons: TrackingDiscount[];
	};
	resolved_query_params?: Record<string, string>;
	append_affonso_id_enabled?: boolean;
	message?: string;
	status?: string;
}

export class Tracking {
	constructor(private readonly httpClient: HttpClient) {}

	async track(params: TrackingTrackParams): Promise<TrackingResult> {
		return this.httpClient.request({ method: "POST", path: "/track", body: params });
	}
}
