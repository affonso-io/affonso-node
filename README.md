# @affonso/sdk

Official TypeScript SDK for the [Affonso](https://affonso.io) API.

- Complete coverage of all 64 documented API operations
- Zero runtime dependencies; uses the standard `fetch` and Web Crypto APIs
- Node.js 18+ and modern browser support
- ESM, CommonJS, and TypeScript declarations
- Auto-pagination, retry with backoff, typed errors, and optional HMAC signing

## Installation

```bash
npm install @affonso/sdk
```

## Quick start

```ts
import Affonso from "@affonso/sdk";

const affonso = new Affonso("sk_live_...");

const page = await affonso.affiliates.list({ limit: 50 });

for await (const affiliate of page.autoPaginate()) {
  console.log(affiliate.id);
}
```

## Configuration

```ts
const affonso = new Affonso("sk_live_...", {
  baseUrl: "https://api.affonso.io/v1", // default
  timeout: 30_000,                       // default: 30 seconds
  maxRetries: 2,                         // retries 429 and 5xx responses
  signingSecret: "your-s2s-secret",      // optional HMAC signing
  fetch: customFetch,                    // optional fetch implementation
});
```

When `signingSecret` is set, the SDK automatically signs conversion, refund, event, and source-ingestion requests. The signature covers the exact JSON string sent in the request body.

## Resources

| Resource | Methods |
| --- | --- |
| `affiliates` | `list`, `retrieve`, `create`, `update`, `del`, `retrieveOnboardingResponses`, `submitOnboardingResponses`, `createPortalToken` |
| `referrals` | `list`, `retrieve`, `create`, `update`, `del` |
| `clicks` | `create` |
| `signups` | `create` |
| `commissions` | `list`, `retrieve`, `create`, `update`, `del` |
| `conversions` | `create`, `refund` |
| `events` | `create` |
| `sources` | `ingest`, `ingestSegment` |
| `tracking` | `track` |
| `payouts` | `list`, `retrieve`, `update` |
| `coupons` | `list`, `retrieve`, `create`, `del` |
| `embedTokens` | `create` |
| `marketplace` | `list`, `retrieve` |
| `onboardingForm` | `retrieve`, `create`, `update`, `del` |
| `program` | `retrieve`, `update` |
| `program.paymentTerms` | `retrieve`, `update` |
| `program.tracking` | `retrieve`, `update` |
| `program.restrictions` | `retrieve`, `update` |
| `program.groups` | `list`, `retrieve`, `create`, `update`, `del` |
| `program.creatives` | `list`, `retrieve`, `create`, `update`, `del` |
| `program.notifications` | `list`, `update` |
| `program.portal` | `retrieve`, `update` |
| `program.fraudRules` | `retrieve`, `update` |

## Onboard an affiliate

Create the team onboarding form:

```ts
const form = await affonso.onboardingForm.create({
  name: "Partner application",
  description: "Tell us how you plan to promote our product.",
  questions: [
    {
      question: "What is your primary channel?",
      type: "single_choice",
      is_required: true,
      options: ["Content", "Email", "Paid media"],
      order: 0,
    },
  ],
});
```

Submit an affiliate's answers and mark onboarding complete:

```ts
await affonso.affiliates.submitOnboardingResponses("aff_123", {
  responses: [
    {
      question_id: form.questions[0].id,
      answer: "Content",
    },
  ],
  mark_complete: true,
});
```

## Track server-side activity

Configure the signing secret used by your Affonso API environment, then create an idempotent conversion:

```ts
const affonso = new Affonso("sk_live_...", {
  signingSecret: process.env.AFFONSO_SIGNING_SECRET,
});

const conversion = await affonso.conversions.create({
  external_user_id: "customer_123",
  external_event_id: "order_987",
  sale_amount: 99,
  sale_amount_currency: "USD",
  product_ids: ["pro_plan"],
});
```

Send a non-monetary milestone event through the same signed request path:

```ts
await affonso.events.create({
  event_name: "demo_booked",
  event_type: "lead",
  external_user_id: "customer_123",
  external_event_id: "demo_456",
  occurred_at: new Date().toISOString(),
});
```

The authenticated `signups.create()` method converts an existing click into a lead:

```ts
await affonso.signups.create({
  click_id: "ref_123",
  email: "customer@example.com",
  external_user_id: "customer_123",
});
```

## Call the public tracking endpoint

`tracking.track()` is a thin, typed wrapper around `POST /track`. It does not collect browser information and is not a replacement for Affonso's browser pixel. Pass consent, advertising identifiers, page context, and user-agent data explicitly.

```ts
const click = await affonso.tracking.track({
  programId: "prog_123",
  trackingId: "partner-name",
  referrer: "https://example.com/pricing",
  userAgent: request.headers.get("user-agent") ?? "",
  hasConsent: true,
});
```

## Pagination

Affiliates, commissions, coupons, payouts, marketplace programs, and creatives use offset pagination:

```ts
const page = await affonso.affiliates.list({ page: 1, limit: 25 });
const nextPage = await page.getNextPage();
```

Referrals use cursor pagination:

```ts
const page = await affonso.referrals.list({ limit: 25 });
const nextPage = await page.getNextPage();
```

Both page types support asynchronous iteration across all remaining pages:

```ts
for await (const item of page.autoPaginate()) {
  console.log(item.id);
}
```

## Expand related data

Pass expand and include fields as comma-separated strings matching the API:

```ts
const affiliate = await affonso.affiliates.retrieve("aff_123", {
  expand: "promoCodes,commissionOverrides,invoiceDetails,payoutMethod,onboardingResponses",
});

const referral = await affonso.referrals.retrieve("ref_123", {
  expand: "affiliate",
  include: "stats",
});

const commissions = await affonso.commissions.list({
  expand: "affiliate,referral",
});
```

## Handle errors

```ts
import {
  DuplicateError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@affonso/sdk";

try {
  await affonso.affiliates.retrieve("missing");
} catch (error) {
  if (error instanceof NotFoundError) {
    // 404 / NOT_FOUND
  } else if (error instanceof RateLimitError) {
    console.log(error.retryAfter);
  } else if (error instanceof ValidationError) {
    console.log(error.details);
  } else if (error instanceof DuplicateError) {
    console.log(error.field);
  }
}
```

All SDK errors extend `AffonsoError` and can include `status`, `code`, `field`, `details`, and response `headers`.

## Migrating from 0.2.x

Version 1.0 removes program-setting fields that were not accepted by the current API. Update integrations to use the current snake_case fields, including:

- `track_email` → `email_tracking_enabled`
- `track_name` → `name_tracking_enabled`
- `postbacks` → `postbacks_enabled`
- current payment-term, restriction, portal, fraud-rule, creative, and notification models

See [CHANGELOG.md](./CHANGELOG.md) for the full breaking-change summary.

## License

MIT
