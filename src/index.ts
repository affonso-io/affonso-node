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
	AffiliatePromoCode,
	AffiliateRetrieveParams,
	AffiliateUpdateParams,
	CommissionOverride,
	InvoiceDetails,
	OnboardingQuestion,
	OnboardingResponses,
	PartnershipStatus,
	PayoutDetails,
	PayoutMethod,
	PayoutMethodResponse,
} from "./resources/affiliates.js";

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

// Resource types — Coupons
export type {
	Coupon,
	CouponCreateParams,
	CouponListParams,
	CouponProvider,
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

// Default export
export { Affonso as default } from "./client.js";
