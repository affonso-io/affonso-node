import { HttpClient, type HttpClientConfig } from "./http.js";
import { Affiliates } from "./resources/affiliates.js";
import { Clicks } from "./resources/clicks.js";
import { Commissions } from "./resources/commissions.js";
import { Coupons } from "./resources/coupons.js";
import { EmbedTokens } from "./resources/embed-tokens.js";
import { Marketplace } from "./resources/marketplace.js";
import { Payouts } from "./resources/payouts.js";
import { Program } from "./resources/program.js";
import { Referrals } from "./resources/referrals.js";

export interface AffonsoConfig {
	baseUrl?: string;
	timeout?: number;
	maxRetries?: number;
	fetch?: typeof globalThis.fetch;
}

const DEFAULT_BASE_URL = "https://api.affonso.io/v1";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

export class Affonso {
	readonly affiliates: Affiliates;
	readonly referrals: Referrals;
	readonly clicks: Clicks;
	readonly commissions: Commissions;
	readonly coupons: Coupons;
	readonly payouts: Payouts;
	readonly program: Program;
	readonly embedTokens: EmbedTokens;
	readonly marketplace: Marketplace;

	constructor(apiKey: string, config?: AffonsoConfig) {
		if (!apiKey) {
			throw new Error(
				"An API key is required. Pass it as the first argument: new Affonso('sk_...')",
			);
		}

		const httpConfig: HttpClientConfig = {
			apiKey,
			baseUrl: config?.baseUrl ?? DEFAULT_BASE_URL,
			timeout: config?.timeout ?? DEFAULT_TIMEOUT,
			maxRetries: config?.maxRetries ?? DEFAULT_MAX_RETRIES,
			fetch: config?.fetch ?? ((...args) => globalThis.fetch(...args)),
		};

		const httpClient = new HttpClient(httpConfig);

		this.affiliates = new Affiliates(httpClient);
		this.referrals = new Referrals(httpClient);
		this.clicks = new Clicks(httpClient);
		this.commissions = new Commissions(httpClient);
		this.coupons = new Coupons(httpClient);
		this.payouts = new Payouts(httpClient);
		this.program = new Program(httpClient);
		this.embedTokens = new EmbedTokens(httpClient);
		this.marketplace = new Marketplace(httpClient);
	}
}
