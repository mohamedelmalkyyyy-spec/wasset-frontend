# Waseet — Final Frontend Handoff Audit

20 November 2026. Read-only review of the approved Vanilla implementation, README, routes, components, fixtures, storage modules, schema mapping and integration notes. Only this report was created. No application source was changed, no browser session was started, and the 74 integration tests were not repeated. Prior integration results are historical evidence, not a new test certification.

## 1. Complete page inventory

Routes below are relative to the deployed frontend root: `/` when serving `frontend/` directly, or `/frontend/` when mounted beneath the repository root. There are **34 application documents**: `index.html` plus 33 documents under `pages/`. Query variations and dialogs are states, not additional HTML pages.

| Route | Purpose / access |
| --- | --- |
| `index.html` | Public homepage, search and advertiser entry points |
| `pages/properties.html` | Public search, advanced filters, sorting, grid/list and pagination |
| `pages/property.html?id=…` | Public eligible property, gallery, advertiser, contact/report actions and related listings |
| `pages/advertiser.html?id=…` | Public advertiser identity and eligible inventory |
| `pages/auth.html` | Shared login, registration and phone-verification demo; `mode=register` selects registration |
| `pages/favorites.html` | Saved properties for the current active demo account; shared across registered roles |
| `pages/account/index.html` | Owner dashboard: counts/statuses and inventory summary |
| `pages/account/properties.html` | Owner inventory and listing actions |
| `pages/account/property-form.html` | Owner add/edit wizard; `id` identifies an edit, links also use `mode=edit` |
| `pages/account/notifications.html` | Shared signed-in account notification center: Seeker, Owner, Broker, Agency and Agent |
| `pages/broker/index.html` | Independent Broker dashboard |
| `pages/broker/properties.html` | Broker inventory and listing actions |
| `pages/broker/property-form.html` | Broker add/edit wizard |
| `pages/agency/index.html` | Agency summary, counts and property/employee overview |
| `pages/agency/properties.html` | Agency inventory, assignments and listing actions |
| `pages/agency/property-form.html` | Agency add/edit wizard |
| `pages/agency/employees.html` | Employee list, addition, membership and permission dialogs |
| `pages/agent/index.html` | Agent dashboard restricted to assigned inventory |
| `pages/agent/properties.html` | Assigned properties and permitted actions |
| `pages/agent/property-form.html` | Authorized Agent add/edit using Agency workflow |
| `pages/admin/index.html` | Administrative summaries and pending-work panels |
| `pages/admin/listings.html` | Pending new-listing queue |
| `pages/admin/listing.html?id=…` | New-listing review, approval or rejection |
| `pages/admin/edits.html` | Property modification queue |
| `pages/admin/edit.html?id=…` | Approved/proposed comparison and decision |
| `pages/admin/users.html` | Search/filter account directory |
| `pages/admin/user.html?id=…` | Account details and suspension/reactivation |
| `pages/admin/agencies.html` | Agency directory |
| `pages/admin/agency.html?id=…` | Agency details, employees and associated properties |
| `pages/admin/verification.html` | Verification requests queue |
| `pages/admin/verify.html?id=…` | Verification evidence metadata and decision |
| `pages/admin/reports.html` | Reports queue |
| `pages/admin/report.html?id=…` | Report details and resolve/close decision |
| `pages/admin/notifications.html` | Separate administrative inbox and read controls |

Two additional navigable HTML documents are **development-only**: `foundation-preview.html` and `preview/nested/index.html`. They demonstrate components and nested mounting; exclude them from production routes. HTML fragments under `components/` are not standalone pages.

No standalone Seeker dashboard exists: Favorites and the shared notification center serve that role. No implemented profile/settings, password-recovery, verification-submission/upload, comparison or featured-listing management page should be inferred from these routes. Employee permissions, reporting, confirmations and email previews are dialogs inside implemented pages.

## 2. Project structure

| Location | Responsibility |
| --- | --- |
| `index.html`, `pages/` | Page documents and module entry wiring; Arabic RTL |
| `components/public/` | Header/footer, desktop/mobile navigation, home search, property filters/card, report/demo dialogs |
| `components/account/` | Shell, header/sidebar/mobile host/page container; Agency/Agent overview and employee fragments |
| `components/admin/` | Shell, header/sidebar/mobile host/page container and breadcrumbs |
| `components/shared/patterns.html` | Development pattern gallery, not a production page |
| `css/` | Tokens, reset/base, typography, common controls, responsive rules and property cards |
| `css/layouts/` | Public, Account and Admin shell styles; Admin relies on shared Account primitives and loads after Account CSS |
| `css/pages/` | Home/listings/details/auth/notifications, Owner/Agency and administrative page styles |
| `js/core/` | Trusted local fragment loader, root-relative URL/icon resolver and shell/dialog initialization |
| `js/pages/`, `js/account/`, `js/admin/` | Public page, publisher-role and administrative DOM controllers |
| `js/shared/` | Navigation, search, cards/detail helpers, favorites, identity/status/directory, publisher/team stores, moderation, verification, reports and notification helpers |
| `data/properties.json` | Shared lookup/property/image/publisher fixtures |
| `data/search-scenarios.js` | Extra presentation/filter scenarios; not an expanded database schema |
| `data/admin-demo.js` | Administrative presentation fixtures, selectively reconciled to actual demo identities |
| `assets/` | Remote-photo manifest, SVG symbol sprite, font/image folder notes; no bundled photograph binaries or Cairo font binaries |
| `tests/`, batch/integration notes | Focused workflow regression evidence and implementation limitations |

Native ES modules and fetched local fragments require HTTP serving, not `file://`. No application build/package installation is required. `path-resolver.js` derives the frontend root from its module URL; retain nested-mount support. Common `w-` classes and existing tokens preserve the approved Desert Modern design. Cairo currently loads from Google Fonts with Tahoma/Arial fallbacks; images depend on remote hosts. The SVG sprite is local at `assets/icons/source-icons.svg`. No approved branded favicon is packaged.

**Documentation drift:** README contains Batch 1–3 snapshots, statements that storage/workflows do not exist, an old tree and “Batch 4 has not started.” These are obsolete for current handoff. Use actual files and later batch/integration notes for current scope; update README in a separately approved documentation change. Development screenshots/preview assets are not production dependencies.

## 3. Navigation and routing

- **Public:** `public-routes.js` connects Home, browse/sale/rent/type filters, Favorites, login/registration and publish. Search state is serialized in query parameters, including repeated filter groups, ranges, sort, page and view. `properties.js` uses browser history and restores state on `popstate`.
- **Property journey:** `navigation.js` carries selected `id`, `from` and `back` context. Detail/profile/related-card destinations use shared helpers. Invalid, expired and unavailable records render explicit states rather than exposing pending content.
- **Account:** `account/owner.js`, `broker.js`, `agency.js`, `agent.js` configure the common shell. Owner/Broker/Agency have dashboard, inventory and form destinations; Agency adds employees. Agent navigation/actions depend on current assignment and permissions. Notifications use `pages/account/notifications.html` across roles. Unsupported private links are removed/handled instead of representing implemented pages.
- **Admin:** `admin/shell.js` maps only the implemented dashboard, listing/edit/user/agency/verification/report queues/details and notifications. The Admin inbox is separate from account inboxes. Admin pages are demo previews, not authenticated administration.
- **Authentication:** `demo-auth.js` whitelists same-origin frontend returns; `afterLogin()` additionally checks private role destinations. `intent=publish` selects the role's form; `save` resumes a favorite action. Default Seeker destination is Favorites; publisher roles use their own dashboards. Agents join via Agency invitation, not public registration; Admin is not publicly registered. Logout clears current demo identity and returns home. Property-form breadcrumbs/success returns go to the same-role inventory, preserving valid inventory filters.
- **MVC requirement:** replace `.html` destinations/whitelists with server-generated routes while retaining query/filter context. Validate return URLs again on the server; DOM visibility and client checks never authorize access.

## 4. MVC migration map (proposal only)

All 34 application pages above should become Razor Views or explicitly shared views. Preserve their rendered markup/classes, RTL, spacing and interactions; these suggestions organize server responsibilities, not a new UI.

| Current page group | Suggested MVC responsibility / views |
| --- | --- |
| Homepage | `HomeController.Index` |
| Listings/details | `PropertiesController.Index`, `Details`; validated search/pagination and public eligibility |
| Advertiser | `AdvertisersController.Details`; public-safe identity and inventory projection |
| Auth | `AccountController` login/register/verify/logout; one view with existing panels is acceptable |
| Favorites | `FavoritesController.Index` and authenticated add/remove operations |
| Owner/Broker/Agency/Agent dashboard and inventory | Role/Area dashboard actions, scoped inventory and property create/edit operations; reuse view templates where markup permits |
| Agency employees | Agency employee list/add/membership/permission/assignment operations |
| Shared account notifications | Authenticated `NotificationsController.Index` and read-state actions |
| All `pages/admin/*` | Protected Admin Area controllers for Dashboard, Listings, Modifications, Users, Agencies, Verification, Reports and Notifications |

Use `_PublicLayout`, `_AccountLayout` and `_AdminLayout` in place of the current shells, with the existing body/page containers as render-body locations. Authentication can use a minimal dedicated layout preserving its current page. Convert header/footer/navigation/sidebar/mobile hosts/breadcrumbs, property cards, filters/search, report/confirmation dialogs and role-overview fragments to partials or View Components. Keep one sidebar instance moving into the mobile dialog; avoid duplicate IDs/listeners. Keep the pattern gallery out of production.

CSS, SVG assets, `shell-init.js` dialog/menu behavior, pure search/URL helpers and gallery/form interaction code can remain independent native JavaScript/static assets under `wwwroot`. Replace local fragment fetching with server rendering and adjust initialization so partials are not loaded twice. Adapt page controllers, card rendering, route helpers and data loaders to ViewModels/server routes. **Demo stores are reference behavior, not production persistence.** Remove their production imports and fixture bootstrapping after server integration. Retain pure client filtering only as an enhancement to authoritative server search.

## 5. Backend requirements

### Documented schema boundary

The following are the existing entities/fields recorded in `../docs/ERD_TO_UI_MAPPING.md`; this report adds none. Nullability, numeric bounds, enum serialization and role IDs remain backend contract decisions.

| Entity | Documented fields |
| --- | --- |
| `roles` | `id`, `name` |
| `users` | `id`, `role_id`, `full_name`, `phone`, `email`, `password_hash`, `avatar_url`, `created_at`, `is_active`, `is_verified` |
| `broker_profiles` | `id`, `user_id` (unique), `company_id`, `whatsapp`, `bio`, `is_approved` |
| `companies` | `id`, `name`, `phone`, `address`, `logo_url`, `is_approved` |
| `property_categories` | `id`, `name`, `sort_order` |
| `property_types` | `id`, `category_id`, `name`, `image_url` |
| `areas` | `id`, `name`, `description`, `latitude`, `longitude`, `is_active` |
| `properties` | `id`, `user_id`, `property_type_id`, `area_id`, `title`, `description`, `price`, `listing_type`, `status`, `rent_period`, `size_m2`, `bedrooms`, `bathrooms`, `floor`, `finishing_type`, `is_featured`, `views_count`, `created_at`, `updated_at` |
| `property_images` | `id`, `property_id`, `url`, `is_main`, `sort_order` |
| `favorites` | `user_id`, `property_id` (composite key), `created_at` |
| `inquiries` | `id`, `sender_id`, `receiver_id`, `property_id`, `message`, `status`, `created_at` |

`inquiries` is outside the phone/WhatsApp-only MVP interaction. `is_featured` exists in the schema but featured listings and comparison remain excluded. Category is derived through property type; do not add it to properties from UI selectors. Never send `password_hash` to a browser.

### Operations and contracts

- **Read/create/update:** public eligible listings/search/details/advertisers/lookups; authenticated favorite list/add/remove; publisher create/update/read own inventory; employee invite/membership/permissions/assignment; Admin queues, decisions, user/agency details and activation. Property images require upload/order/cover/removal handling. No general hard-delete workflow or lookup-management screen is implemented; define retention/removal separately rather than claiming complete CRUD UI.
- **Identity/security:** implement real credentials, secure password hashing/session handling, logout, email/mobile verification, invitation acceptance and recovery contracts. Enforce Owner/Broker ownership, Agency scope, Agent assignment plus view/create/edit/manage permissions, Admin-only operations and suspension on every request. Agency suspension blocks employee access; reactivation must preserve ownership/assignments and must not override disabled membership. Add server validation, CSRF protection, safe output encoding and local-return validation.
- **Publication/modification:** new listings require Admin approval; rejection requires a reason. Price/images/description proposals coexist with approved public data until approved together; rejection leaves that data unchanged. Decisions must reject stale/repeated reviews and commit public changes/counters/notifications consistently. Existing status labels are demo values, not agreed database enums.
- **Availability/renewal:** available/sold/rented is distinct from publication review. Sold/rented hides public availability. Manual renewal adds 30 days from the later of now/current deadline in the current demo; edit approval does not renew. Agree authoritative clock/time zone, publication start/expiry processing, permitted actors and audit semantics; `created_at`/`updated_at` alone are insufficient.
- **Uploads:** current wizard checks JPG/PNG/WebP, up to six images and 2 MiB aggregate new-image content for session quota practicality. Ratify production limits; validate file content and dimensions server-side, store safely, generate public image URLs, retain cover/order and protect pending replacements. Verification evidence requires separately protected storage/authorized streaming, never public image URLs.
- **Verification/reports:** implement durable requests, evidence and rejection/resubmission decisions; distinguish contact verification, advertiser verification and profile/company approval. Reports support fake/duplicate/misleading/other, active reporter checks and resolve/close decisions. Closing/resolving currently does not automatically remove a property; do not invent an enforcement rule.
- **Notifications/email:** durable recipient-scoped in-app events, unread state, mark/read/all, valid related routes and event deduplication. Cover listing/edit decisions and verification for accounts, and new listings/edits/verification/reports for Admin. Agency decisions also notify the current assigned Agent in the demo. Actual email needs templates, approved sender/provider, queued delivery/retries and privacy controls; current previews are explicitly unsent.
- **External dependencies:** choose approved production image hosting and Google Fonts delivery/self-hosting policy. Phone/WhatsApp use supplied validated contacts only; define WhatsApp sourcing beyond `broker_profiles.whatsapp`. Current property location panel has no interactive map/provider; fixture areas have no coordinates. Area coordinates, when supplied, describe an area, not a precise property pin. Approve provider, licensing/privacy and location contract before adding a map. No payment/chat provider is required by the implemented contact flow.

### Existing unresolved capability gaps

Preserve documentation gaps G01–G12 as separate design decisions: Agency identity/permissions; assignments; review history/reasons; approved/proposed coexistence; renewal history/expiry; verification requests/evidence; reports; notification/delivery state; non-Broker WhatsApp sourcing; amenities/payment-method/availability presentation attributes; authentication/recovery; upload/public visibility contracts. The ERD does not fully represent these capabilities. Session keys, fixture attributes and UI journals must **not** be copied into schema as if already approved entities/columns.

## 6. Demo limitations

| Module/state | What is simulated |
| --- | --- |
| `demo-auth.js`, `waseet-demo-v1` | Email-based demo identities/roles/current account and account-specific favorites. Password fields validate visually but passwords are never authenticated or stored. Registration phone is displayed, not persisted as a real user record. |
| `verification-state.js`, `waseet-contact-demo-v1` | Fixed phone code `123456`; resend sends nothing. No email confirmation mechanism. |
| `owner-store.js`, `broker-store.js`, `agency-store.js` | `waseet-owner-v1`, `waseet-broker-v1`, `waseet-agency-v1`: created records, pending edits, availability and renewal terms; uploaded images are data URLs, not stored server files. |
| `agency-team.js`, `agent-store.js` | `waseet-agency-team-v1`: employees, memberships, permissions and assignments. Invitation email enables same-tab demo login; no invitation is delivered. Agent actions delegate to Agency inventory. |
| `moderation-state.js` / `moderation-store.js` | `waseet-moderation-v1`: review outcomes and public-data projections over fixtures. Client rollback is not a database transaction or concurrency guarantee. |
| `account-directory.js` / `account-status.js` | Reconciled fixture/registered/employee directory and `waseet-account-status-v1` suspension overrides; no production identity directory or authorization. |
| `verification-state.js`, `admin/trust-store.js` | `waseet-verification-v1`: decisions/badges over bound fixture requests. Document preview is labelled metadata only; no real private documents or submission/upload page. |
| `reports-store.js` | `waseet-reports-v1`: reports and administrative decisions with existing fixture seeds; no durable abuse-management service. |
| `notification-store.js` and related helpers | `waseet-notifications-v1`: bounded event/read journal and local email previews; first-observation reconciliation timestamps are not real submission times. |
| Shared data/search/detail modules | Fixture properties, areas, user/Agency identity bindings, amenities/payment scenarios, counts and client-side search. Demo ID formats/email identities are not production key contracts. Missing contacts/coordinates are unavailable, never fabricated. |

All persisted demo state is origin/same-tab `sessionStorage`, survives reload/navigation and is editable by the browser user. It is quota-limited, not multi-user/device persistence, a privacy boundary or a source of authoritative counts. Other tabs/origins need not share it; duplicating a tab may copy an initial browser snapshot. Clearing/closing the session loses changes. Public data merging enforces demonstration eligibility only. Admin pages remain directly accessible previews. No backend calls, real file upload, verification SMS, invitation email or notification delivery occur.

## 7. .NET handoff checklist

- [ ] Use the 34-page inventory as implemented scope; exclude both preview documents/gallery from production.
- [ ] Replace stale README snapshots after approval; retain batch/integration notes as historical evidence.
- [ ] Agree G01–G12 contracts, real IDs/enums, validation/nullability, Egyptian currency/rent periods and type-specific fields before persistence work.
- [ ] Build the three layouts/partials and ViewModels while preserving approved HTML/CSS/RTL and responsive behavior.
- [ ] Move static assets/modules to `wwwroot`; generate routes, replace fragment loading and preserve nested deployment/query returns.
- [ ] Replace all fixture/session-store dependencies with authenticated server reads/writes; exclude secrets and private evidence from public payloads.
- [ ] Implement credential/contact verification/invitations, role/resource policies, suspension, CSRF protection and server-side validation.
- [ ] Implement scoped property/image operations, pending approval/rejection, approved/proposed preservation, manual availability and 30-day renewal/expiry.
- [ ] Implement Agency membership/assignment/permissions without changing publisher ownership or losing assignments on suspension.
- [ ] Implement protected verification evidence, reports/decisions and durable recipient-specific notifications; connect email only after provider/sender approval.
- [ ] Approve asset hosting, contact sources and optional map/location service; never substitute invented contact/location data.
- [ ] Verify migrated role isolation, public eligibility, stale decisions/transaction rollback, return-URL safety, upload security and notification privacy against the existing behavior.
- [ ] Run deployment-focused end-to-end, Arabic RTL/responsive, keyboard/accessibility and supported-browser checks after MVC integration. Prior 74-test evidence does not certify the new server implementation.

**Handoff status:** approved frontend preserved; backend integration and the documented contracts remain outstanding. No implementation changes are authorized by this report.
