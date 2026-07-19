export { Affonso, type AffonsoConfig } from "./client.js";

// Errors
export {
	AffonsoError,
	AuthenticationError,
	ConnectionError,
	DuplicateError,
	InternalError,
	NotFoundError,
	PermissionError,
	RateLimitError,
	ValidationError,
} from "./errors.js";

// Pagination
export { CursorPage, OffsetPage } from "./pagination.js";

// Types
export type {
	ApiResponse,
	CursorPaginatedResponse,
	CursorPaginationParams,
	DeleteResponse,
	ErrorResponse,
	OffsetPaginatedResponse,
	OffsetPaginationMeta,
	OffsetPaginationParams,
	RequestMethod,
	RequestOptions,
	SingleResponse,
} from "./types.js";

// Resource types — Affiliates
export type {
	Affiliate,
	AffiliateCreateParams,
	AffiliateExpandField,
	AffiliateListParams,
	AffiliateOnboardingResponses,
	AffiliatePortalToken,
	AffiliatePromoCode,
	AffiliateRetrieveParams,
	AffiliateUpdateParams,
	CommissionOverride,
	InvoiceDetails,
	OnboardingQuestion,
	OnboardingResponseSubmitParams,
	OnboardingResponses,
	PartnershipStatus,
	PayoutDetails,
	PayoutMethod,
	PayoutMethodResponse,
} from "./resources/affiliates.js";

// Resource types — Onboarding Form
export type {
	OnboardingForm,
	OnboardingFormCreateParams,
	OnboardingFormQuestion,
	OnboardingFormUpdateParams,
	OnboardingQuestionInput,
	OnboardingQuestionType,
} from "./resources/onboarding-form.js";

// Resource types — Referrals
export type {
	Referral,
	ReferralCreateParams,
	ReferralListParams,
	ReferralRetrieveParams,
	ReferralStats,
	ReferralStatus,
	ReferralUpdateParams,
} from "./resources/referrals.js";

// Resource types — Clicks
export type { Click, ClickCreateParams } from "./resources/clicks.js";

// Resource types — Commissions
export type {
	Commission,
	CommissionCreateParams,
	CommissionExpand,
	CommissionListParams,
	CommissionRetrieveParams,
	CommissionStatus,
	CommissionUpdateParams,
	SalesStatus,
} from "./resources/commissions.js";

// Resource types — Server-side tracking
export type {
	Conversion,
	ConversionCreateParams,
	ConversionInterval,
	ConversionRefundParams,
} from "./resources/conversions.js";
export type {
	EventCreateParams,
	EventResult,
	EventType,
	S2SEvent,
} from "./resources/events.js";
export type { SignupCreateParams } from "./resources/signups.js";
export type {
	SegmentTrackParams,
	SourceAdapter,
} from "./resources/sources.js";
export type {
	TrackingDiscount,
	TrackingResult,
	TrackingTrackParams,
} from "./resources/tracking.js";

// Resource types — Coupons
export type {
	Coupon,
	CouponCreateParams,
	CouponListParams,
	CouponProvider,
	CouponProviderRecord,
	CouponRetrieveParams,
	DiscountType,
	Duration,
} from "./resources/coupons.js";

// Resource types — Payouts
export type {
	Payout,
	PayoutDetail,
	PayoutListParams,
	PayoutStatus,
	PayoutTransaction,
	PayoutUpdateParams,
} from "./resources/payouts.js";

// Resource types — Program Settings
export type {
	ProgramSettings,
	ProgramSettingsUpdateParams,
} from "./resources/program-settings.js";

// Resource types — Payment Terms
export type {
	CommissionDuration,
	CommissionType,
	CommissionTypeInput,
	InvoiceRule,
	InvoiceRuleInput,
	PaymentFrequency,
	PaymentTerms,
	PaymentTermsUpdateParams,
} from "./resources/program-payment-terms.js";

// Resource types — Tracking
export type {
	TrackingSettings,
	TrackingSettingsUpdateParams,
	TrackingTemplateEntry,
	TrackingTemplateMacro,
} from "./resources/program-tracking.js";

// Resource types — Restrictions
export type {
	Restrictions,
	RestrictionsUpdateParams,
} from "./resources/program-restrictions.js";

// Resource types — Groups
export type {
	Group,
	GroupCreateParams,
	GroupExpandField,
	GroupIncentive,
	GroupMultiLevelIncentive,
	GroupListParams,
	GroupRetrieveParams,
	GroupUpdateParams,
} from "./resources/program-groups.js";

// Resource types — Creatives
export type {
	Creative,
	CreativeCategory,
	CreativeCreateParams,
	CreativeDimensions,
	CreativeListParams,
	CreativeUpdateParams,
} from "./resources/program-creatives.js";

// Resource types — Notifications
export type {
	Notification,
	NotificationType,
	NotificationUpdateParams,
} from "./resources/program-notifications.js";

// Resource types — Portal
export type {
	PortalSettings,
	PortalSettingsUpdateParams,
} from "./resources/program-portal.js";

// Resource types — Fraud Rules
export type {
	FraudRuleMode,
	FraudRules,
	FraudRulesUpdateParams,
} from "./resources/program-fraud-rules.js";

// Resource types — Embed Tokens
export type {
	EmbedPartner,
	EmbedToken,
	EmbedTokenCreateParams,
} from "./resources/embed-tokens.js";

// Resource types — Marketplace
export type {
	MarketplaceListParams,
	MarketplaceCommission,
	MarketplaceProgram,
	MarketplaceTerms,
} from "./resources/marketplace.js";

// Default export
export { Affonso as default } from "./client.js";
