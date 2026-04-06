# @affonso/sdk

Official TypeScript SDK for the [Affonso](https://affonso.io) API.

- Zero dependencies (uses `fetch`)
- Node 18+ and Browser support
- ESM + CJS + TypeScript declarations
- Auto-pagination, retry with backoff, typed errors

## Installation

```bash
npm install @affonso/sdk
```

## Quick Start

```ts
import Affonso from '@affonso/sdk';

const affonso = new Affonso('sk_live_...');

// List affiliates (offset pagination)
const page = await affonso.affiliates.list({ limit: 50 });
console.log(page.data);        // Affiliate[]
console.log(page.pagination);  // { page, limit, total, total_pages, has_next_page, has_prev_page }

// Auto-paginate through all pages
for await (const affiliate of page.autoPaginate()) {
  console.log(affiliate.id);
}

// CRUD
const aff = await affonso.affiliates.create({
  name: 'Max',
  email: 'max@example.com',
  program_id: 'prog_123',
});
const updated = await affonso.affiliates.update(aff.id, {
  name: 'Max M.',
  status: 'approved',
});
await affonso.affiliates.del(aff.id);
```

## Configuration

```ts
const affonso = new Affonso('sk_live_...', {
  baseUrl: 'https://api.affonso.io/v1', // default
  timeout: 30_000,                       // default: 30s
  maxRetries: 2,                         // default: 2 (retries on 429/5xx)
  fetch: customFetch,                    // custom fetch for testing/edge
});
```

## Resources

| Resource | Methods |
|----------|---------|
| `affiliates` | `list`, `retrieve`, `create`, `update`, `del` |
| `referrals` | `list`, `retrieve`, `create`, `update`, `del` |
| `clicks` | `create` |
| `commissions` | `list`, `retrieve`, `create`, `update`, `del` |
| `coupons` | `list`, `retrieve`, `create`, `del` |
| `payouts` | `list`, `retrieve`, `update` |

## Pagination

**Offset pagination** (affiliates, commissions, coupons, payouts):

```ts
const page = await affonso.affiliates.list({ page: 1, limit: 25 });
const nextPage = await page.getNextPage(); // null if no more pages
```

**Cursor pagination** (referrals):

```ts
const page = await affonso.referrals.list({ limit: 25 });
const nextPage = await page.getNextPage(); // uses starting_after cursor
```

Both support `autoPaginate()` for iterating through all pages:

```ts
for await (const item of page.autoPaginate()) {
  // yields every item across all pages
}
```

## Expandable Fields

Expand fields are passed as comma-separated strings matching the API:

```ts
// Affiliates: promoCodes, commissionOverrides, invoiceDetails, payoutMethod, onboardingResponses
const affiliate = await affonso.affiliates.retrieve('aff_123', {
  expand: 'promoCodes,commissionOverrides',
});

// Referrals: expand=affiliate, include=stats
const referral = await affonso.referrals.retrieve('ref_123', {
  expand: 'affiliate',
  include: 'stats',
});

// Commissions: affiliate, affiliate_program, referral
const commissions = await affonso.commissions.list({
  expand: 'affiliate,referral',
});

// Coupons: affiliate
const coupons = await affonso.coupons.list({ expand: 'affiliate' });
```

## Error Handling

```ts
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  DuplicateError,
} from '@affonso/sdk';

try {
  await affonso.affiliates.retrieve('nonexistent');
} catch (e) {
  if (e instanceof NotFoundError) {
    // 404 / NOT_FOUND
  }
  if (e instanceof RateLimitError) {
    console.log(e.retryAfter); // seconds until reset
  }
  if (e instanceof ValidationError) {
    console.log(e.details); // field-level errors
  }
  if (e instanceof DuplicateError) {
    console.log(e.field); // conflicting field
  }
}
```

Error hierarchy:

```
AffonsoError (base)
  ├── AuthenticationError (401 / UNAUTHORIZED)
  ├── PermissionError     (403 / FORBIDDEN)
  ├── NotFoundError       (404 / NOT_FOUND)
  ├── ValidationError     (400 / VALIDATION_ERROR) — has .details[]
  ├── DuplicateError      (409 / DUPLICATE_ERROR)
  ├── RateLimitError      (429 / RATE_LIMIT_EXCEEDED) — has .retryAfter
  ├── InternalError       (5xx)
  └── ConnectionError     (network/timeout)
```

All errors include: `status`, `code`, `message`, `field?`, `details?`, `headers`.

## License

MIT
