# Changelog

All notable changes to this project are documented in this file. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Authenticated resources now derive the affiliate program from the API connection. Affiliate, coupon, click, and embed-token inputs no longer accept a program selector.

### Removed

- Removed repeated program identifiers from affiliate, commission, conversion, coupon, click, referral, and signup response types.

### Migration notes

- Remove program identifiers from authenticated SDK calls and responses. Public tracking still requires `programId`.

## [1.0.1] - 2026-07-19

### Fixed

- Corrected HMAC signing behavior and nullable program-settings handling to match the API contract.

## [1.0.0] - 2026-07-19

### Added

- Complete typed coverage for all 64 operations in the Affonso OpenAPI contract.
- Onboarding form CRUD and affiliate onboarding-response methods.
- Affiliate portal-token creation.
- Authenticated signup, automatic conversion, conversion refund, generic event, source-adapter, Segment, and public tracking resources.
- Optional `signingSecret` configuration for browser-compatible HMAC-SHA256 request signing.
- Exact-operation coverage and signed-body contract tests.

### Changed

- Aligned all program settings, payment terms, tracking settings, restrictions, groups, creatives, notifications, portal settings, and fraud rules with current API schemas and response transforms.
- Aligned affiliate VAT data, referral identifiers, coupon provider records, marketplace programs, embed tokens, commissions, and payouts with current API behavior.
- Updated the package documentation and examples for the complete v1 resource surface.

### Removed

- Removed obsolete tracking fields `track_email`, `track_name`, and `postbacks`, along with `TrackingPostback`.
- Removed obsolete payment-term invoice and duration fields.
- Removed outdated restriction, creative, notification, portal, and fraud-rule fields that the API no longer accepts.

### Migration notes

- Replace `track_email` with `email_tracking_enabled` and `track_name` with `name_tracking_enabled`.
- Replace the old `postbacks` array with the `postbacks_enabled` flag.
- Use `commission_duration` values `lifetime`, `time_limited`, or `payment_limited` and the new `commissions_limit`, `commissions_hold_days`, `payment_methods`, and `invoice_rule` fields.
- Update embed-token creation to pass a nested `partner` object.
- Read marketplace commission and payment terms from the nested `commission` and `terms` objects.

[1.0.1]: https://github.com/affonso-io/affonso-node/releases/tag/v1.0.1
[1.0.0]: https://github.com/affonso-io/affonso-node/releases/tag/v1.0.0
