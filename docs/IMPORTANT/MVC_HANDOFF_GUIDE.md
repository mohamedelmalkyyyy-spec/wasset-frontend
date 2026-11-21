# Waseet — MVC Handoff Guide

20 November 2026. Documentation handoff for the approved HTML/CSS/Vanilla JavaScript frontend. Preserve its Arabic RTL design, Cairo typography, Desert Modern palette and behavior. No .NET project, application changes, dependencies or test runs accompany this guide.

Use [Frontend/backend contracts](FRONTEND_BACKEND_CONTRACTS.md) for operation-level requirements, [ERD mapping](ERD_TO_UI_MAPPING.md) for schema authority, and [final audit](../frontend/FINAL_HANDOFF_AUDIT.md) / [integration notes](../frontend/INTEGRATION_PASS_B_NOTES.md) for the handoff baseline. Earlier planning documents are historical intent; implemented scope is the inventory below. Features absent from that inventory are not delivered pages.

## Architecture

The frontend is a static multi-page application served over HTTP. Documents fetch local shared HTML fragments, initialize native ES modules and use fixture projections plus same-tab sessionStorage for demonstrations. It requires no frontend framework, build or package installation. Public browsing does not require demo login. Current root-aware paths support serving `frontend/` at `/` or mounting it beneath `/frontend/`.

| Location | Responsibility |
| --- | --- |
| `frontend/index.html`, `pages/` | Page markup, module entry wiring and role-specific documents |
| `components/public/`, `account/`, `admin/` | Shared shells, navigation, page containers and composed UI fragments |
| `css/` | Tokens/reset/base/typography/common components/responsive/property-card rules |
| `css/layouts/`, `css/pages/` | Shell and page styles; Admin relies on Account primitives and loads after them |
| `js/core/` | Trusted fragment loading, root-relative paths/icons, navigation/dialog/drawer initialization |
| `js/pages/`, `js/account/`, `js/admin/` | Page and role controllers, Admin summaries/queues |
| `js/shared/` | Search, navigation, cards/details, favorites and all demo workflow stores |
| `data/` | Shared property/lookups, search scenarios and Admin presentation fixtures |
| `assets/` | Remote image manifest, local SVG sprite, font/image notes |
| `tests/`, implementation notes | Existing focused regression evidence and historical scope records |

No authentication or persistence exists on a server. Existing UI validation and role visibility are behavioral references, not authorization. No passwords are stored. Fictional email/fixture IDs are not production identity contracts.

## All 34 application pages

Paths are relative to the frontend mount. Query strings select states, not extra pages. Every row should become a Razor View or a deliberately shared view; preserve its rendered markup. The two additional development documents (`foundation-preview.html`, `preview/nested/index.html`) and HTML fragments are excluded from this count and production navigation.

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

Favorites and account notifications are shared among active signed-in account roles. Seeker has no standalone dashboard. Reporting, employee permissions, confirmation/rejection and simulated email previews are dialogs within existing pages. Profile/settings, recovery and verification-submission/upload screens are not implemented. Featured listings and comparison are excluded from MVP.

## Proposed controllers and actions

These are organizational suggestions, **not approved endpoint URLs or transport contracts**. MVC route templates, HTTP methods, payload serialization, action signatures and response status codes are **PENDING**. A conventional form post/redirect/render flow or progressive enhancement can satisfy the behavioral contracts; a REST API is not required.

| Responsibility | Proposed controller/actions | Source pages |
| --- | --- | --- |
| Public landing | `HomeController.Index` | Homepage |
| Public search and property | `PropertiesController.Index`, `Details` | Listings/details |
| Public advertiser | `AdvertisersController.Details` | Advertiser profile |
| Account identity | `AccountController.Login`, `Register`, `VerifyPhone`, `Logout` | Auth panels; recovery/email verification integration remains PENDING without delivered screens |
| Saved properties | `FavoritesController.Index`, `Add`, `Remove` | Favorites and public card/detail controls |
| Publisher dashboard | Role/Area `DashboardController.Index` | Owner/Broker/Agency/Agent index pages |
| Publisher inventory | Role/Area `PropertiesController.Index`, `Create`, `Edit`, `Renew`, `SetAvailability` | Inventory/forms and existing actions; share services, enforce resource policies |
| Agency team | Agency `EmployeesController.Index`, `Invite`, `SetMembership`, `SetPermissions`, `AssignProperty` | Employees/permission dialogs and assignment action |
| Account events | `NotificationsController.Index`, `SetReadState`, `MarkAllRead` | Shared account center and indicators |
| Admin landing | Admin Area `DashboardController.Index` | Administrative summary |
| New-listing moderation | Admin `ListingsController.Index`, `Details`, `Approve`, `Reject` | Listing queue/review |
| Proposed modifications | Admin `ModificationsController.Index`, `Details`, `Approve`, `Reject` | Edit queue/comparison |
| Account/Agency administration | Admin `UsersController.Index`, `Details`, `SetActive`; `AgenciesController.Index`, `Details`, `SetActive` | Users/agencies queues/details |
| Verification | Admin `VerificationController.Index`, `Details`, `Approve`, `Reject` | Verification queue/review |
| Reporting | `ReportsController.Submit`; Admin `ReportsController.Index`, `Details`, `Resolve`, `Close` | Public dialog, Admin reports |
| Admin events | Admin `NotificationsController.Index`, `SetReadState`, `MarkAllRead` | Separate Admin center |

Namespaces/Areas may consolidate duplicated view templates without consolidating authorization boundaries. Do not introduce unused CRUD screens or hard-delete behavior merely because a controller exists.

## Three Razor layouts and partial mappings

| Proposed layout | Existing structure | Migration rule |
| --- | --- | --- |
| `_PublicLayout` | Public header, desktop/mobile navigation, footer, public page body | Public pages/Favorites; auth may use a chrome-suppression option to preserve its existing presentation, without a fourth required layout |
| `_AccountLayout` | Account shell/header/sidebar/mobile host/page container | Role-configured navigation and existing dashboard/form content; account notifications shared by all signed-in roles |
| `_AdminLayout` | Admin shell/header/sidebar/mobile host/page container/breadcrumbs | Authenticated Admin Area; retain Account primitive CSS dependency |

| Existing fragment / UI | Suggested partial or composition |
| --- | --- |
| `components/public/header.html`, `footer.html` | `_PublicHeader`, `_PublicFooter` |
| Public navigation/mobile fragments | `_PublicNavigation`, `_PublicMobileNavigation` |
| `home-search.html`, `property-filters.html` | `_HomeSearch`, `_PropertyFilters` |
| `property-card.html` and shared card renderer | `_PropertyCard`; same public eligibility and action behavior |
| `report-dialog.html`, `demo-dialog.html` | `_ReportDialog`, existing message/confirmation partial; remove obsolete demo-only copy only as part of authorized integration |
| Account header/sidebar/mobile/page container | `_AccountHeader`, `_AccountSidebar`, `_AccountMobileNavigation`, layout body slot |
| `agency-overview.html`, `agent-overview.html`, `agency-employees.html` | Role overview/employee partials bound to scoped ViewModels |
| Admin header/sidebar/mobile/breadcrumbs | `_AdminHeader`, `_AdminSidebar`, `_AdminMobileNavigation`, `_AdminBreadcrumbs` |
| Existing inline form/review/dialog sections | Reusable form/decision partials where structure is actually shared; preserve labels, IDs and hooks |
| `components/shared/patterns.html` | Development-only; do not ship as application UI |

Keep one sidebar moving between its desktop slot and native mobile dialog; do not duplicate element IDs or bind handlers twice. Preserve focus restoration, Escape handling, active navigation, error/empty states and responsive table behavior.

## Static assets, JavaScript and routes

Move approved CSS, SVG and browser modules to `wwwroot` with equivalent relative organization. Keep token values and page/layout ordering. Photographs remain remote URLs recorded in `assets/manifest.json`; Cairo currently loads from Google Fonts. No local photo/font binaries or approved branded favicon are packaged. Hosting/self-hosting/licensing decisions are PENDING.

`js/core/shell-init.js` and pure search functions, gallery, menu/dialog, client validation and card interaction behavior can stay independent Vanilla JavaScript. Adapt `path-resolver.js`, navigation/public/admin route helpers and page initialization to server-generated routes. Server-render partials instead of fetching them with `component-loader.js`; do not run both composition systems on the same markup. Replace fixture loading and demo stores, not their visible behavior. Remove fixture bootstrap and test preview entrypoints from production initialization.

Preserve search query groups/ranges, sorting/pagination and back/forward restoration. Carry selected property/advertiser IDs and safe return context. Do not hardcode drive paths or assume root deployment. Revalidate local return destinations on the server and reject cross-role private returns. Guests saving/publishing enter authentication; resume only authorized intended actions. Logout ends the real session and returns home.

## Authentication and role permissions

| Role/access | Required server boundary |
| --- | --- |
| Guest | Public eligible listing/advertiser reads/search and supplied phone/WhatsApp contact; no saving/reporting/publishing |
| Seeker | Own favorites/notifications and eligible report submission; no publisher inventory |
| Owner | Own property creation, inventory, editing, availability and manual renewal |
| Independent Broker | Own brokerage inventory and corresponding publisher actions |
| Agency | Agency-scoped inventory, membership, assignments and employee permissions; real account-to-company ownership remains PENDING G01 |
| Agent | Active Agency and membership, assigned inventory and current view/create/edit/manage grants; never all Agency records |
| Admin | Protected administrative operations and inbox; never publicly registered |

Public registration supports Seeker, Owner, Independent Broker and Agency only. Real role IDs, verification/approval gates, identity configuration and invitation acceptance are PENDING. Implement secure credentials/sessions, CSRF protection, server validation and output encoding. Password hashes never enter public/ViewModel payloads. Client-supplied publisher/role/Agency IDs cannot establish ownership.

Suspending an account blocks access and mutation and hides its advertiser's public listings. Agency suspension also blocks employees. Preserve ownership, favorites, pending work and assignments. Reactivation restores eligibility but must not reactivate membership disabled by the Agency Manager.

## Property and Agency workflows

1. Publisher submission stays pending and invisible publicly until Admin approval. Reject with a required reason; show the result to the publisher. Exact persisted transition/history contract is PENDING G03.
2. Price/images/description proposals are reviewed together. Keep approved public data visible while proposals are pending or rejected. Approval publishes the accepted version; stale/repeated decisions must fail safely. Approved/proposed storage is PENDING G04.
3. Availability (available/sold/rented) is separate from publication state; sold/rented hides the listing. Enum storage is PENDING G10. Expired listings are unavailable until a permitted manual renewal.
4. Demo renewal adds 30 days from the later of now/current deadline; edit approval does not reset expiry. Production clock, history, expiry processing and renewal authority are PENDING G05. Do not derive expiry solely from creation/update dates.
5. Manager adds an employee, controls active membership and view/create/edit/manage grants, and assigns Agency properties. An inactive/suspended employee cannot receive a new assignment. Administrative suspension preserves existing assignments; membership/view revocation follows the existing team behavior that clears assignments. Production representation/audit is PENDING G01–G02.
6. Agent-created properties enter the same Agency pending inventory and are assigned to the creator in the demo. Agent edits do not change publisher ownership. Enforce permissions again for every operation and direct resource access.

Image previews are client interactions, not uploads. Demo controls allow six JPG/PNG/WebP images and 2 MiB aggregate new-image content; production limits are PENDING G12. Validate file content/dimensions, safe storage/URLs and ordering/cover/removal server-side, retaining approved images during review.

## Admin, verification, reports and notifications

Admin summaries and queues must derive from authoritative scoped data, not separate counters/fixture arrays. New listings/modifications require confirmation and rejection reasons. User/Agency suspension/reactivation preserves relationships. Verification decisions update advertiser verification consistently but do not automatically prove email/mobile ownership or equate profile/company approval with user verification.

Verification preview currently contains only user-approved, labelled mock document metadata. No real document file/submission/upload screen exists. Real evidence needs authenticated private streaming and storage; no private document metadata/rejection reason belongs in public profiles or notifications. G06 defines the missing lifecycle.

Reports support fake, duplicate, misleading and other categories; other requires explanation. Resolve/close records a decision and does not automatically hide the property. Reporter eligibility, abuse controls, enforcement and durable decision representation are PENDING G07.

Account events cover listing/modification approval/rejection and verification decisions. Admin events cover new listing/modification/verification/report requests. Agency listing decisions also notify the currently assigned Agent. Recipient/read-state isolation, deduplication and valid destinations are required. Existing email previews explicitly send nothing. Production in-app persistence, email templates/provider/sender, delivery/retry policy and preferences are PENDING G08. Commit workflow state and notification intent consistently; use actual event timing rather than demo first-observation times.

## Existing ERD entities and fields

This is the documented schema, not a schema expansion. Required/null fields, ID types and enum values still need agreement. A single user role and broker-company link do not fully express all Agency workflows.

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

Preserve `broker_profiles.user_id` uniqueness and the `favorites` composite key. Join properties → type → category; do not add a property category column from the UI. Area coordinates are approximate area context, not exact property coordinates. `inquiries` is outside the phone/WhatsApp-only MVP; `is_featured` does not authorize an excluded featured feature. View counting remains a server policy.

## PENDING G01–G12 decisions and dependencies

| Gap | Decision required before production integration |
| --- | --- |
| G01 | Agency account/company ownership, employee membership, registration eligibility, role/grant model |
| G02 | Assignment/reassignment, permission history, employee deactivation effects and Agent action scope |
| G03 | Publication transitions, reviewer/history, required rejection reasons and public eligibility |
| G04 | Approved/proposed coexistence, comparison, concurrent edits, rejection/resubmission |
| G05 | Authoritative publication/expiry/renewal clock, early renewal, processing/history and authority |
| G06 | Verification request lifecycle/evidence per role, private files, reasons and resubmission |
| G07 | Reporter eligibility, category/target representation, decisions, enforcement and abuse controls |
| G08 | Durable recipients/events/read state, preferences, delivery/retries and safe navigation targets |
| G09 | Approved WhatsApp source/contact identity for roles beyond Broker |
| G10 | Amenities/payment scenarios, availability and publisher presentation data beyond direct ERD support |
| G11 | Authentication/session, contact verification, invitation/recovery and error contracts |
| G12 | Upload limits/validation/hosting, private evidence access and inactive/unapproved public visibility |

No additional tables/columns are specified here. Backend owners must resolve these capabilities through an approved schema/contract process. Transport details remain PENDING in the contract matrix.

Additional external decisions: production image storage and asset licensing; Cairo hosting; optional map provider/licensing/privacy; email/SMS provider and approved sender/contact data. Current area fixtures have no coordinates; no map provider is integrated. Do not invent phone numbers or coordinates. Phone/WhatsApp is direct handoff, not in-app messaging or a payment workflow.

## Demo functionality to replace

Replace all `sessionStorage` identity/favorites, publisher records/proposals/data-URL images/terms/availability, employees/assignments/permissions, moderation outcomes, suspension overrides, verification/contact evidence, reports and notification journals with authenticated durable services. Keep recipient/role isolation and error/empty behavior. No browser state is authoritative.

Replace `properties.json`, `search-scenarios.js`, `admin-demo.js`, hard-bound fixture identities and bootstrap reconciliation with approved database projections. Amenities/payment scenario attributes are not schema definitions. Demo passwords are neither stored nor verified; fixed OTP is not contact assurance. Invitation emails, SMS and email notifications are not sent. Document previews are metadata only. Admin routes are currently unprotected previews. Session quotas/rollback and tab isolation do not provide transactions, security or concurrency handling.

## Recommended MVC implementation sequence

1. **Contract gate:** agree G01–G12, roles/IDs/enums/nullability, public-safe projections, operation/error semantics and external services. Record PENDING outcomes before schema assumptions.
2. **Render baseline:** introduce the three layouts/partials/static assets and all existing view routes without redesign. Validate nested mounting, RTL, keyboard/dialog behavior and safe navigation.
3. **Identity and scope:** real authentication/logout/verification/invitations, resource authorization, account activation and Agency membership/assignment policies. Verify direct access as well as hidden controls.
4. **Public data:** lookups, eligible search/details/advertisers, safe contact/location projection and per-account favorites; preserve query/back navigation.
5. **Publisher/moderation vertical slice:** scoped create/images → Admin approval/rejection → public projection; then important edits/comparison with approved-version preservation and concurrency controls. Integrate notification intent as the workflow commits.
6. **Lifecycle/team:** manual availability and renewal/expiry, Agency employee/permission/assignment and Agent operations; preserve assignments on administrative suspension.
7. **Trust/Admin completion:** user/Agency administration, protected verification evidence, reports and counters; no unsupported public document exposure.
8. **Events and delivery:** connect durable inbox/read states and badges to workflow events, then approved email/SMS delivery with retry/idempotency and privacy checks; eliminate demo bootstrapping.
9. **Production verification:** remove all demo imports/preview deployment, verify security/uploads/transactions/time rules, run migrated journeys and responsive/Arabic/accessibility/browser checks. Existing integration evidence does not certify the new backend.

Stop points are contract/review gates for the receiving team, not authorization to create server code in this repository. The current documentation change creates no application implementation.
