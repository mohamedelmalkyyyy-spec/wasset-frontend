# Waseet — Frontend / Backend Contracts

20 November 2026. Behavioral contract worksheet for the existing Vanilla frontend and its MVC replacement. See [MVC handoff guide](MVC_HANDOFF_GUIDE.md) for every page and proposed controllers, [ERD mapping](ERD_TO_UI_MAPPING.md) for existing entities/fields, and [handoff audit](../frontend/FINAL_HANDOFF_AUDIT.md) for the implementation baseline.

## Contract status and conventions

**No API endpoints are specified.** MVC route templates, HTTP methods, action signatures, request/response DTOs, serialization, status codes and error envelopes are **PENDING** for every operation below. “Response” describes the data/rendered outcome the current interface needs, not a proposed JSON object or database field. Inputs are existing schema attributes or existing UI input concepts; UI concepts outside the ERD are explicitly PENDING and do not authorize new columns/tables.

Known behavior is distinguished from missing persistence/security contracts. G01–G12 refer to the existing gap register. Even ERD-backed operations require backend validation/authorization; none is a delivered server operation. Suggested controller names in the guide are organizational proposals, not endpoint agreements.

Common requirements apply to every row:

- Resolve the actor, role, ownership, Agency and permissions from the authenticated server context. Never trust browser-supplied ownership/role flags or demo email IDs as authority.
- Validate IDs, requiredness, ranges, lookup activity, type-specific applicability and authorization on every request. Production ID types/nullability/enums and final bounds are PENDING. Output-encode text; protect state changes against CSRF and replay/stale operations as applicable.
- Return a user-safe success, validation, not-found/unavailable, denied/suspended, stale-decision or service-failure outcome. Exact transport/error representation is PENDING. Fail without exposing another account's data or silently losing approved content.
- Keep public projections separate from private requests/evidence/decision reasons. Exclude `password_hash` everywhere in browser payloads. Permission checks must cover direct URLs and mutation operations, not just navigation visibility.
- Use server-generated local routes and validate return destinations again on the server. Preserve safe filters/IDs/back context. Client `return`, `from`, `back`, `save`, `intent`, `mode` and filter aliases are navigation/UI state, not ERD fields.

## Public website, search and contact

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| `frontend/index.html`: homepage | Read public homepage data and active lookups | Optional existing search selections | Eligible latest cards, lookup/category/area labels and consistent counts; empty/error state | Guest allowed | Apply current publication/expiry/availability/advertiser eligibility; G03/G05/G10/G12 PENDING |
| `pages/properties.html`: search/filter/sort/page | Query eligible properties with supported joins | Existing UI `q`; repeated `listing_type`, `category_id`, `property_type_id`, `area_id`, `bedrooms`, `bathrooms`, `finishing_type`, `rent_period`; `min_price`, `max_price`, `min_size`, `max_size`; `sort`, `page`, `view`; scenario `amenity`, `payment_method` | Public cards, filtered result count, page information and accepted filter state; comparable price ordering | Guest allowed | UI aliases are not new columns. Category joins through type. Validate nonnegative/reversed ranges, allowed values and type applicability. Search normalization, production page size/order, scenario filters G10 and expiry G05 PENDING |
| `pages/property.html?id=…`: open details/gallery/related | Read eligible property and joined area/type/category/publisher/images | Selected property identity | Approved public fields, ordered cover/gallery, supported amenities, public advertiser/contact projection, related eligible listings; missing/expired/unavailable state | Guest allowed | Do not return pending proposal/private review data. Related selection/view-count policy PENDING; G03–G05/G10/G12 |
| `pages/advertiser.html?id=…`: profile/inventory | Read public advertiser projection and eligible properties | Existing advertiser identity | Public identity/badge and listings, or unavailable state | Guest allowed | Respect suspension/profile/company/public eligibility; never include document names/reasons/private evidence. G01/G06/G12 PENDING |
| Details/profile: phone/WhatsApp | Provide approved public contact values; browser performs direct handoff | Existing user phone, Broker WhatsApp where supported; selected listing context | Valid `tel:`/WhatsApp action or disabled/unavailable contact | Guest allowed for public contacts | Validate supplied numbers; do not invent contacts. Owner/Agency/Agent WhatsApp source/contact identity PENDING G09; no inquiry composer or messaging service |
| Details: location panel | Provide only approved area location information | `area_id`; documented `areas.latitude`, `longitude` when actually supplied | Area context or explicit missing-location/provider state | Guest allowed | Area coordinates are not an exact property pin. Current fixtures have none. Provider/service/precise-location contract PENDING G10; no invented coordinates |

Search semantics demonstrated today: AND between filter groups, OR within each group, normalized Arabic keyword matching, applicable specifications, invalid-range errors, browser-history restoration and numeric sorting. Production query/index/currency/rent-unit policy is PENDING; do not compare incomparable price periods without an agreed rule.

## Identity, favorites and return navigation

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| `pages/auth.html`: login | Authenticate and establish a real session | Email and credential entered in existing form; safe return/publish/save context | Authenticated identity and allowed role destination; resume eligible favorite/publish intent | Anonymous login entry; reject suspended account or inactive Agency/member | Credential/session/lockout/rate/error policy PENDING G11. Do not imitate demo email-only login or expose account-sensitive errors |
| Auth: registration | Register eligible public account | Existing form full name, email, phone, password/confirmation and selected account type | Pending/verified registration outcome and continuation matching approved lifecycle | Public Seeker/Owner/Broker/Agency only | Map full name to `users.full_name`; never persist confirmation/plaintext password. Role IDs, duplicate handling, Agency ownership and approval gates PENDING G01/G11 |
| Auth: phone code/resend | Verify phone ownership and issue/resend challenge | Registration phone, entered code and registration context (representation PENDING) | Verified/pending/invalid/expired/retry outcome; no false success | Only actor entitled to the registration/contact challenge | Replace fixed `123456`; TTL, attempt/rate limits, SMS provider, phone normalization and storage PENDING G06/G11. Email verification is separate and has no implemented screen |
| Shared logout | Invalidate server session | Authenticated context and legitimate logout intent | End session, return homepage; preserve durable account data | Current authenticated actor | CSRF/session invalidation contract PENDING G11; do not delete favorites/ownership |
| Post-login publish/save/return | Resolve allowed local continuation | Existing `return`, `intent=publish`, optional selected `save`; current server role | Safe original public destination or correct scoped dashboard/form | Current authenticated actor; publishers only for create | Reject external/cross-role private returns. Agent permission checked at form/action too. Seeker cannot publish. G01/G11 route/policy contracts PENDING |
| `pages/favorites.html`; card/detail save/remove | Read own favorites; add/remove unique favorite pair | Selected `property_id` for change; actor resolved server-side | Own eligible saved cards and saved state; empty state after last removal | Active signed-in account | `favorites(user_id, property_id)` unique; user cannot choose another user. Recheck eligibility and stale property, define unavailable saved-item presentation. Persistence/error semantics PENDING G12 |

Password recovery and verification submission are backend dependencies without delivered pages; their route/payload/response/UI contracts remain PENDING, not an implied extra implementation scope.

## Publisher inventory and property lifecycle

This section applies to `pages/account/{index,properties,property-form}.html` (Owner), `pages/broker/{index,properties,property-form}.html`, `pages/agency/{index,properties,property-form}.html` and `pages/agent/{index,properties,property-form}.html`. Brace notation describes existing files, not proposed routes. The guide lists each of the 12 documents individually.

Existing property form content: `title`, `description`, `price`, `listing_type`, `property_type_id`, `area_id`, `rent_period`, `size_m2`, `bedrooms`, `bathrooms`, `floor`, `finishing_type`; category is a UI selector derived through type. Images are selected files plus existing ordering/cover intent, not trusted file paths. Actor/ownership/status/time values are server-controlled.

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| Role dashboard/index | Read scoped summaries and recent inventory | Server actor; optional current status context | Counts/statuses, recent property rows, current pending work and expiry summary; no charts | Active Owner/Broker/Agency or permitted Agent | Count from same authoritative scope as list; never use independent fixture totals. G01–G05/G10 PENDING |
| Role properties: list/search/status | Read scoped inventory and proposals | Current title/status filter and actor context | Only owned/Agency/assigned records, pending edits/rejection explanations and current term/availability | Owner/Broker own; Agency own scope; Agent assigned + view | Direct-ID and filter scope enforced; enum/date/proposal representation PENDING G01–G05/G10 |
| Add form: initial load | Read active lookups and create authority | Actor context | Permitted form choices or access denial | Owner/Broker/Agency; Agent active + view/create | Confirm actual type/area/category values and active lookups. G01/G02/G12 PENDING |
| Add form: submit | Create pending property submission and image references | Existing form fields/files above | Pending inventory item, confirmation and Admin notification intent; not public | Authorized publisher; Agent creates within Agency context | Validate fields/type specifications/images and duplicate submit. Derive publisher; never trust `user_id`/status. Atomic submission/assignment/notification intent. G01–G04/G08/G12 PENDING |
| Edit form: load | Read editable scoped record and current proposal | Selected property identity | Approved/proposed form values or denied/missing state | Owner/Broker own; Agency scope; Agent assigned + view/edit | Prevent cross-identity access and superseded request exposure; G02/G04 PENDING |
| Edit form: submit price/images/description | Persist proposed important changes for review | Selected property and form/proposed images; concurrency context representation PENDING | Pending modification and Admin event; last approved public content unchanged | Authorized editor as above | Stale edits/duplicate submissions/validation; approved/proposed storage and atomicity PENDING G04/G08/G12 |
| Edit form: other field changes | Apply demonstrated review-aware property edit behavior | Remaining existing form fields | Consistent inventory/public outcome without bypassing important-edit review | Same editor scope | Exact field-level policy for mixed edits is PENDING G03/G04/G10; receiving team must not assume all non-important edits bypass approval |
| Inventory: manual renewal | Extend eligible listing term by 30 days | Selected property and explicit confirmation | Updated authoritative deadline/eligibility; pending edits unchanged | Owner/Broker/Agency; assigned Agent with view/manage | Current demo uses later of now/current deadline. Real clock/time zone, start/history, expiry and replay/concurrency rules PENDING G05; do not use only creation/update date |
| Inventory: availability | Record manual available/sold/rented choice | Selected property and existing UI choice | Updated scoped availability/public eligibility; same owner and approved version | Owner/Broker/Agency; assigned Agent with view/manage | Keep separate from publication decision; mapping/storage PENDING G10. Recheck assignment and concurrent status |
| Image preview/add/remove/order | Upload validated property files; preserve ordered public/proposed image sets | Selected JPG/PNG/WebP, existing property/image identity and cover/order intent | Authorized image references usable in the form/gallery, or safe validation error | Authorized creator/editor | Current demo six files/2 MiB aggregate new content is not an approved production quota. Verify content/dimensions, safe storage/access, cleanup and cover uniqueness; G04/G12 PENDING |

No general hard-delete listing workflow or lookup CRUD screen is delivered. Deletion/retention and orphan-image cleanup policy remain PENDING; do not add user-facing actions through this document.

## Agency and Agent boundaries

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| `pages/agency/employees.html`: list/search | Read Agency employees/membership/permissions and assignments | Agency derived from actor; current name/email search | Own team, membership/global suspension distinctions and assignment counts | Active Agency Manager | Do not merge identical names or expose another Agency; identity/membership relation PENDING G01/G02 |
| Employees: add | Invite eligible employee | Existing dialog name, email, phone, membership choice | Own-team employee/invitation outcome; current demo delivers no email | Agency Manager for own Agency | Validate email/phone/name/duplicates and identity conflicts. Real invitation/acceptance/delivery/persistence PENDING G01/G02/G08/G11 |
| Employees: permissions/membership | Update current employee grants/membership | Existing employee selection; view/create/edit/manage UI choices, membership active choice | Updated authority and assignment effects visible across Agent views | Manager of same Agency | Cannot override global Admin suspension. Membership/view revocation currently clears assignments; production audit/transaction contract PENDING G01/G02 |
| `pages/agency/properties.html`: assign/reassign | Assign Agency listing to eligible employee or clear assignment | Existing property and employee selection | Updated assignment/counts without publisher ownership change | Manager of same Agency | Both property/member must belong to Agency; member active with view and globally active for new assignment. Preserve existing assignment on Admin suspension. G01/G02 PENDING |
| Agent dashboard/list/direct form/action | Re-evaluate assigned-resource permissions | Server Agent identity plus selected property/action | Only allowed inventory/action; explicit denial for unauthorized create/edit/manage | Active Agent, Agency and membership; current assignment/grants | Do not cache stale grants as authority; no foreign-property form content. Creation must join Agency pending workflow and creator assignment. G01–G04 PENDING |

Permission labels and assignment inputs describe existing UI concepts; they are not ERD columns. Real assignment identities, membership/grant representation and manager authority are PENDING.

## Administrative operations

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| `pages/admin/index.html`: summaries/panels | Read authoritative account/listing/review/verification/report totals and pending subsets | Admin context | Four summary cards and pending listing/verification/recent-report panels with valid links or empty state | Authenticated Admin | Same data/eligibility as queues, no separate fixture authority; G01/G03/G06/G07 PENDING |
| `pages/admin/listings.html`, `listing.html`: list/review | Read pending new submissions/details | Current queue filters and selected submission identity | Review content, owner/Agency context and valid decision controls | Admin only | No fabricated identity binding; stale/missing completed records handled. G01/G03/G12 PENDING |
| Listing review: approve/reject | Commit publication decision | Selected submission, approve/reject intent, rejection explanation; concurrency context PENDING | Published or rejected outcome, synchronized inventory/public visibility/counters and recipient event intent | Admin only | Required nonblank rejection reason; repeated/stale decisions refused; atomic publication/images/events. G03/G05/G08/G12 PENDING |
| `pages/admin/edits.html`, `edit.html`: list/compare | Read pending modification with approved version | Current queue/selected request identity | Clearly separated approved/proposed data and changed images/price/description | Admin only | Public consumers never see proposal. Real request/version identity and comparison contract PENDING G04 |
| Modification review: approve/reject | Accept/reject specific proposal | Selected proposal, decision and rejection explanation; concurrency context PENDING | Accepted proposal replaces approved data, or rejection leaves it unchanged; publisher/assigned Agent events | Admin only | Required rejection reason; reject stale/repeated comparisons; edit approval must not renew. G04/G05/G08/G12 PENDING |
| `pages/admin/users.html`, `user.html`: list/details | Read account directory/details | Name/email/phone search; role/status/verification UI filters; selected identity | Supported six-role directory/contact/status/verification, safe details or missing state | Admin only | Server identity resolution, no name-based merging, private data minimized. Real role/Agency relationships PENDING G01/G06/G11 |
| `pages/admin/agencies.html`, `agency.html`: list/details | Read Agency directory/detail, employees and associated properties | Search/selected Agency identity | Correct Agency record and related scoped information; unavailable values explicit | Admin only | A company row alone is not an Agency login; association/ownership PENDING G01/G02 |
| User/Agency detail: suspend/reactivate | Change existing account activity consistently | Selected account/Agency and explicit confirmation/desired activity | Updated `users.is_active` meaning, public eligibility and access; relationships retained | Admin only | Preserve ownership/favorites/assignments/proposals; Agency suspension blocks Agent; do not override manager-disabled membership. G01/G11 identity mapping and stale-change semantics PENDING |
| `pages/admin/verification.html`, `verify.html`: list/review | Read private verification request/contact evidence | Selected applicant/request identity | Request/evidence and independently described email/mobile status; missing/empty/error state | Admin only | G06 request/evidence lifecycle PENDING; mock metadata is not evidence. No public document projection |
| Verification detail: preview | Authorize access to protected evidence if real evidence is provided | Existing selected request/document reference, representation PENDING | Secure preview/stream or unavailable file; no public storage URL | Authorized Admin only | File ownership/type/privacy/access checks; storage/streaming/retention PENDING G06/G12. Current UI has metadata only |
| Verification: approve/reject | Record decision and advertiser verification projection | Selected request, decision and rejection explanation | Updated verification/badges and applicant notification intent | Admin only | Rejection reason mandatory; stale/repeated review rejected. Do not imply contact verification or equate company/profile/user flags. G06/G08 PENDING |
| Public property report dialog | Submit eligible report | Selected property, fake/duplicate/misleading/other category and explanation | Submission confirmation and Admin event intent; original property remains unchanged | Active signed-in account | Public eligible target, active reporter; other needs explanation. Anti-abuse/rate/representation PENDING G07/G08 |
| `pages/admin/reports.html`, `report.html`: list/details | Read reports with target and available reporter information | Current filters and selected report identity | Report/property/reporter context and review state | Admin only | No private evidence exposure or invented reporter; seed IDs not real keys. G07 PENDING |
| Report review: resolve/close | Record administrative decision | Selected report, resolve/close intent and optional existing decision note | Completed decision and consistent report totals; no automatic property removal | Admin only | Refuse repeated/stale outcomes. Enforcement separate and PENDING; durable decision/history/retention G07 |

## Notifications and delivery

| Frontend page/action | Required backend operation | Input data | Expected response / UI outcome | Authorization | Validation / PENDING |
| --- | --- | --- | --- | --- | --- |
| `pages/account/notifications.html`: list/filter, public/account indicators | Read current recipient inbox/unread total | Authenticated actor, all/unread UI selection | Own events, unread count, valid permitted related links and empty/error state | Active signed-in account | Recheck target access; no other account's events/private documents. Persistence/paging/retention/preferences PENDING G08 |
| `pages/admin/notifications.html`: list/filter, Admin indicators | Read administrative inbox/unread total | Authenticated Admin, all/unread selection | Admin receipts and valid review destinations | Admin only | Define Admin recipient scope/shared read semantics; demo `@admin` is not an agreed identity. G08 PENDING |
| Either center: mark read/unread/all | Update recipient-scoped read state | Selected current event and read choice, or current inbox mark-all intent | Consistent event state and counter across reload/navigation | Recipient only; Admin authorized inbox policy | No cross-recipient writes; concurrent/new-event mark-all boundary and representation PENDING G08 |
| Existing workflow submission/decision | Record durable event and delivery intent | Authorized committed listing/edit/verification/report transition and derived recipients | Account decision events; Admin new-work events; Agency/assigned Agent copies where entitled | Internal workflow operation after actor authorization | Deduplicate, preserve actual event time, synchronize with workflow commit and safe targets. Retry/failure/recipient policy PENDING G08 |
| Email simulation preview → real delivery replacement | Render approved template; enqueue/send through approved provider | Existing authorized event, actual recipient and approved template content | Current UI continues to distinguish preview from actual queued/sent/failed outcome; real delivery status only if supported | Backend workflow, recipient/private template policy | Current system sends nothing. Provider/sender/template/localization, consent/preferences, retries/idempotency and status contract PENDING G08; no fabricated “delivered” response |

Notifications are a missing backend capability, not an ERD-defined entity. Do not turn browser journal attributes into database columns without approval. Real phone code/invitation delivery likewise remains PENDING, not a reuse of a public mock email preview.

## Outstanding decisions before implementation

| Gap | PENDING contract decision |
| --- | --- |
| G01 | Roles/permissions and Agency identity, ownership and membership |
| G02 | Employee assignments, deactivation effects and action scope/history |
| G03 | Publication review lifecycle/history/reasons/public eligibility |
| G04 | Approved/proposed version coexistence and concurrency |
| G05 | Renewal/expiry authority, start/early renewal/time zone/history/processing |
| G06 | Verification requests/evidence/contact assurance and resubmission |
| G07 | Reports, moderation outcome/enforcement and abuse handling |
| G08 | Events/recipients/read state/preferences and email delivery/retries |
| G09 | WhatsApp contact sourcing for non-Broker advertisers |
| G10 | Amenities/payment/availability/publisher attributes and location limits |
| G11 | Authentication, session, recovery and real verification/invitation contracts |
| G12 | Upload/storage/access limits and related-record public eligibility |

Production routes/methods/payload/error schemas remain PENDING even when the user-visible behavior above is known. Also ratify actual lookup IDs, enums, currency/rent periods, input bounds, public/private projections, removal/retention, upload hosting and optional map service. No new entities, fields or endpoint URLs are approved here.

## Integration order and acceptance gates

Follow the full [guide sequence](MVC_HANDOFF_GUIDE.md#recommended-mvc-implementation-sequence): contracts → layouts/routes/assets → identity/scoping → public reads/favorites → publisher/moderation → renewal/team → Admin trust → event delivery → production validation.

For each operation, agree its PENDING contract first, replace its demo store/fixture path, then verify the successful, invalid, denied, missing, stale and storage/service-failure outcomes relevant to it. Preserve approved public data and ownership through review/suspension. Notification intent must not be lost or duplicated when transactions/retries fail. Keep existing URL context, Arabic RTL, responsive behavior and accessibility. This document did not run tests or implement any backend operation.
