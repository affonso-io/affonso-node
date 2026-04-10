import type { HttpClient } from "../http.js";
import { ProgramCreatives } from "./program-creatives.js";
import { ProgramFraudRules } from "./program-fraud-rules.js";
import { ProgramGroups } from "./program-groups.js";
import { ProgramNotifications } from "./program-notifications.js";
import { ProgramPaymentTerms } from "./program-payment-terms.js";
import { ProgramPortal } from "./program-portal.js";
import { ProgramRestrictions } from "./program-restrictions.js";
import {
	ProgramSettingsResource,
	type ProgramSettings,
	type ProgramSettingsUpdateParams,
} from "./program-settings.js";
import { ProgramTracking } from "./program-tracking.js";

// --- Composite Resource ---

export class Program {
	readonly paymentTerms: ProgramPaymentTerms;
	readonly tracking: ProgramTracking;
	readonly restrictions: ProgramRestrictions;
	readonly groups: ProgramGroups;
	readonly creatives: ProgramCreatives;
	readonly notifications: ProgramNotifications;
	readonly portal: ProgramPortal;
	readonly fraudRules: ProgramFraudRules;

	private readonly settings: ProgramSettingsResource;

	constructor(httpClient: HttpClient) {
		this.settings = new ProgramSettingsResource(httpClient);
		this.paymentTerms = new ProgramPaymentTerms(httpClient);
		this.tracking = new ProgramTracking(httpClient);
		this.restrictions = new ProgramRestrictions(httpClient);
		this.groups = new ProgramGroups(httpClient);
		this.creatives = new ProgramCreatives(httpClient);
		this.notifications = new ProgramNotifications(httpClient);
		this.portal = new ProgramPortal(httpClient);
		this.fraudRules = new ProgramFraudRules(httpClient);
	}

	async retrieve(): Promise<ProgramSettings> {
		return this.settings.retrieve();
	}

	async update(params: ProgramSettingsUpdateParams): Promise<ProgramSettings> {
		return this.settings.update(params);
	}
}
