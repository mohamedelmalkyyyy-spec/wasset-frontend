# Waseet — Final Mock Data Guide

20 November 2026. The existing 34-page Vanilla frontend now starts with linked Arabic demonstration scenarios for Sadat City, Menoufia, Egypt. No page was redesigned, no backend/API/database was added, and no real email, SMS, invitation or external message is sent.

## Accounts

Shared demo password: **`Demo@12345`**. Enter it through `pages/auth.html`.

| Role | Email | Display name | Default destination |
| --- | --- | --- | --- |
| User / Property Seeker | `elmalky@gmail.com` | محمد المالكي | `pages/favorites.html` |
| Owner | `elmalky-owner@gmail.com` | محمد أحمد | `pages/account/index.html` |
| Independent Broker | `elmalky-broker@gmail.com` | كريم السيد | `pages/broker/index.html` |
| Agency | `elmalky-agency@gmail.com` | عقارات السادات | `pages/agency/index.html` |
| Agent | `elmalky-agent@gmail.com` | أحمد سمير | `pages/agent/index.html` |
| Admin | `elmalky-admin@gmail.com` | إدارة وسيط | `pages/admin/index.html` |

The password is public fixture configuration compared locally, not real authentication. Account/session records never store it. These Gmail addresses are local demo identifiers only; the application never contacts Gmail or sends to them. The ordinary registration demo remains available for supported public roles; seeded Agent membership belongs to the seeded Agency and Admin cannot register publicly. Fixed verification code `123456` remains an explicitly simulated phone check, not SMS or verified email ownership.

Safe public returns and favorite-save intent still resume after login. Without a return intent, roles use the destinations above. Seeker has no separate invented dashboard. Admin pages remain locally accessible demonstration previews, not protected server administration. The Admin identity also links to the Admin notification center from public navigation.

## Connected property catalogue

**Fresh-session totals:** 27 property identities: 18 base properties and nine existing-store submissions. Every property has an existing type/area, publisher and image references. Each of the three publishing accounts has nine inventory records; only Agency-assigned records appear for the Agent.

| Publisher | Base IDs | Submission IDs | Pending edit |
| --- | --- | --- | --- |
| Owner, publisher user 1 | 1, 3, 6, 7, 8, 9 | 1101 pending; 1102 rejected; 1103 approved | Property 1 |
| Broker, publisher user 3 | 4, 10, 11, 12, 13, 14 | 1201 pending; 1202 rejected; 1203 approved | Property 4 |
| Agency, publisher user 2 | 2, 5, 15, 16, 17, 18 | 1301 pending; 1302 rejected; 1303 approved | Property 5 |

Each publisher starts with six effectively published, one expired, one pending and one rejected listing: nine total. Publication counts include a sold/rented property; they are not public-availability counts. Expired examples are 8, 13 and 17. Sold examples are 9 and 14; rented example is 18. These are existing availability/term scenarios separate from publication state.

The normal fresh public projection contains **15 eligible properties**: five per publisher after excluding pending, rejected, expired and sold/rented examples. Home/latest, listings, favorites, detail/profile and related-card views all use the shared eligibility projection. Statistics derive from the same records, not new hardcoded dashboard totals. Term expiry or user decisions can legitimately change these counts.

Examples include apartments, a villa, commercial shops, administrative offices and residential land, with sale/rent prices, sizes, applicable room counts, Arabic descriptions, ordered images and finishing. All area choices reuse the four existing labels: الحي المتميز، المنطقة الأولى، المنطقة الثانية، المنطقة الثالثة. No additional real neighborhood, address/pin or coordinates were invented.

Photographs reuse existing remote image resources and remain illustrative, not evidence of a real property or its location. Amenity/payment selections remain the existing G10 presentation-scenario mechanism, extended to the populated IDs; they are not database fields. There are no fabricated public advertiser phone/WhatsApp numbers: unavailable contacts remain disabled. Existing employee phone fixtures are reused only as local team examples. No map provider was added; the supported missing-location explanation remains.

## Agency, Agent and account isolation

The Agency has three employees: active أحمد سمير (the requested Agent), active سارة محمود, and inactive محمود علي. The primary Agent has **view/create/edit**, with **manage disabled**. Renewal/availability management is therefore unavailable to that Agent unless the Manager grants it.

| Employee | Assigned IDs | Notes |
| --- | --- | --- |
| أحمد سمير | 5, 16, 1301, 1302, 1303 | Five assigned properties, including approved/pending/rejected cases and the pending edit on 5 |
| سارة محمود | 2, 15 | View/edit/manage enabled; create disabled |
| محمود علي | None | Membership inactive |

The Agent can create through the Agency pending workflow and edit assigned records only; foreign IDs are denied. Agency decisions on assigned properties notify both Manager and Agent through existing workflow hooks. Administrative suspension blocks access/new assignments while preserving existing ownership and assignments. Manager membership/view revocation follows the existing assignment-clearing behavior. Reactivation does not override a Manager-disabled membership.

The initial Admin directory contains eight accounts: the six requested identities plus Sara and Mahmoud. There is one linked Agency and three employees. Actor IDs remain local email identities while original numeric publisher IDs remain unchanged; this is fixture binding, not a new ownership schema.

Favorites are recipient-specific: Seeker begins with properties 1, 4, 5 and 15; Owner/Broker/Agency/Agent each begin with 1 and 5. Admin begins without favorites because its primary destination is administration. Removing a favorite does not affect another account and is not undone on reload.

## Administrative and trust scenarios

Fresh queues contain three pending new listings and three pending modifications. Proposed edits change price/description/image selection while retaining approved public data. Approving publishes the selected version; rejecting requires a reason. Rejected seeded submissions have an explanation and can be corrected/resubmitted. Review results persist within the tab and synchronize inventory/public projections/counters. Manual renewal retains the existing 30-day rule and never silently approves edits.

Verification contains three linked applicant requests: Owner already approved; Broker and Agency pending. Seeker has a labelled demo verification outcome for its account notification, not a verification request or real identity check. Document previews contain names/metadata only; no private identity files exist or are exposed publicly. Approval/rejection continues updating advertiser badges and notification outcomes through existing stores.

| Report | Property | Reporter | Initial outcome |
| --- | --- | --- | --- |
| R-284, misleading information | 1 | Seeker | New |
| R-281, duplicate | 3 | Seeker | In review |
| R-276, fake | 2 | Broker | Resolved, with recorded demo decision |
| R-285, other | 10 | Owner | Closed, with recorded demo decision |

Reporter details link to real demo-directory records. Admin review totals have two outstanding reports; the dashboard's specifically labelled **new** report card counts one. Resolve/close records a result without automatically hiding the property. This distinction is intentional.

Each account inbox has seeded local history: publisher approvals/rejections, Agent assigned-property decisions, and the Seeker demo account-verification message. The Admin inbox receives new listing/edit receipts and linked verification/report requests; existing reconciliation adds missing receipts once. Every email entry is explicitly an **unsent local preview**, with no delivery provider or external messages. Read/unread changes and mark-all remain recipient-scoped and persistent across reloads.

## Population and preservation

- `data/properties.json`: 18 base properties, six identity records, existing lookup categories/types/areas/roles and ordered image references.
- `data/mock-demo.js`: requested identity/password catalogue, publisher ID bindings, seed property/image snapshots and legacy identity aliases. It is readable public demonstration configuration, not credentials/security.
- `data/search-scenarios.js`: supported UI-only amenity/payment examples.
- `data/admin-demo.js`: linked user/Agency/verification/report presentation fixtures; actual queue and account totals come from shared stores.
- `js/shared/demo-population.js`: initializes existing store envelopes once, using marker `waseet-mock-population-v1`. This version marker is local UI metadata, not an ERD field.
- Existing auth, publisher, team, moderation, status, verification, report and notification modules remain responsible for interactions. Seeding does not add a parallel persistence layer.

Public/Admin fragment loading and demo-auth initialization trigger population, including direct page entry. The one-time marker is written with the state transaction only after notification validation. Failure attempts rollback; no partial successful-population marker is left. Malformed saved data or conflicting legacy/new identity keys are rejected without silently discarding them.

Earlier `owner@example.test`, `broker@example.test`, `agency@example.test`, `ahmed@alsadat.example` and `sara@example.com` fixture identities migrate to the requested counterparts, including current identity, related keys/targets and favorites. Existing publisher state, decisions, permission changes, empty favorites and unrelated user text are retained. The six reserved identities keep their requested roles; existing saved display names are retained. Existing publisher/team state is not replaced with a fresh scenario envelope. Consequently an already-used session may show different counts from the fresh-session examples, including a suspension or intentionally cleared list.

All persistence remains same-origin/same-tab **sessionStorage**. Reload/navigation/logout/login preserve changes; closing/clearing the tab session can lose them. A duplicated tab may receive an initial browser snapshot; do not assume synchronized accounts across tabs/devices. For a pristine presentation, use a new independent browser session before making changes. No reset button, automatic reseed, localStorage mirror or destructive reset was introduced. Automatic expiry remains meaningful; expired data is not silently renewed just to keep a demo populated.

## Focused verification

Seven new tests in `tests/mock-population.test.mjs` cover all six roles/password/destinations; linked inventories and directory; isolated favorites and no reseeding; authorized/denied Agent operations; seeded approval/rejection/edit preservation; verification/reports/suspension/inboxes; legacy migration and quota rollback. No previous full audit or 74-test integration run was repeated.

Browser checks signed into all six requested accounts, confirmed populated scoped dashboards and Admin counters/verification/report queues, removed a Seeker favorite and retained that removal after reload, approved Owner submission 1101 and verified its public detail after reload, then checked logout. No screenshot generation or external messaging was needed. Earlier batch/handoff notes, where available, describe older fixture identities/counts rather than this catalogue. Several earlier handoff documents are absent from the current workspace, as noted in README; they were not recreated in this task.

Production authentication, authorization, persistence, uploads, audit history, expiry processing, private evidence, actual notifications/email/SMS and G01–G12 remain backend responsibilities. This data population does not resolve or expand the approved ERD.


## Shared property loading investigation — 21 November 2026

### Observed evidence and root-cause boundary

The reported generic loading error did **not** reproduce on a fresh HTTP preview of the current workspace. Before this change, direct listings access returned 15 matching properties; the current JSON parsed and every type/category/area/publisher/image relationship resolved. The local catalogue request returned HTTP 200. No application console errors were observed during that baseline. Therefore an incorrect deployment URL, failed request, stale response or corrupt state in the reporting browser cannot honestly be named as the exact cause without its failing URL/console evidence. The exact reported environment remains PENDING; the URL was requested separately.

Confirmed code defects were broader than the previous homepage-only sorting fix:

- There was no common asynchronous property loader. Home, listings, Favorites, details/advertiser setup and login-save continuation each fetched and parsed the file separately.
- `browserRecords()` swallowed projection exceptions and returned raw fixtures, allowing public consumers to silently lose the approved/submitted session projection.
- Page-level catches labelled fetch, projection, filter initialization and rendering exceptions with generic loading messages, so the displayed wording did not identify which stage failed.
- Fragment loading also initialized storage before the public pages' data-error handlers. A storage initialization failure could escape those handlers entirely.

The earlier `Array.toSorted` compatibility issue was reproduced and fixed separately; it is not evidence that the later shared symptom had that same cause. No failing request or JSON/category corruption was found in the current clean preview. No localStorage mechanism exists in these property flows; persistent mock interactions remain exclusively in the existing sessionStorage stores.

### Shared loading fix

`js/shared/property-data.js` now provides `loadPropertyRecords()` for every public property consumer. It resolves `data/properties.json` from the existing module-relative frontend root, requests JSON with `cache: no-store`, parses JSON (including a leading UTF-8 BOM), validates required arrays/identities/joins, validates saved JSON and runs existing one-time initialization, then strictly applies the existing moderation projection. It does not contain a second dataset or use hardcoded cards. It does not cache merged records across navigation, reseed a completed session, clear user data, or read localStorage.

Errors are classified as network, HTTP, JSON, catalogue, storage or projection errors, retaining the failing URL and original cause for the console. A server returning HTML with HTTP 200 is a JSON failure, not a successful empty catalogue. Missing category/type/area/publisher references are explicit catalogue failures. Corrupt saved JSON is reported without being erased. Projection failures never return raw fixtures as a substitute.

Home and listings show the specific load-stage explanation in their existing error areas. Public fragment loads defer their demo initialization to the data path so initialization failures reach the existing page handlers; private/Admin fragment initialization keeps its previous behavior. Favorites, details/advertiser setup and favorite-save continuation use the same loader. Existing private/Admin workflows still consume the same underlying JSON through their existing scoped stores; they are not changed to merge public projections a second time.

The homepage keeps its six-card selection. Listings retain existing four-item pagination and expose all 15 initially eligible records across four pages. Search, cards, URL context, per-account favorites, UI classes, Arabic RTL and responsive styles remain unchanged.

### Focused verification

Seven focused tests passed: two homepage initialization cases and five shared-loader tests. They cover repeated independent loads, 27 projected identities/15 eligible records, filters, fresh Admin approval projection without resetting favorites, HTTP 404/offline/HTML/malformed JSON failures, broken category joins, BOM parsing and corrupt saved JSON preservation. They do not repeat the prior full integration suite.

Browser checks independently opened and reloaded Home and Listings. Home rendered six cards after reload; listings exposed all 15 unique eligible IDs across pagination. Rent/shop/area/price/keyword filtering found the correct property, a stricter maximum produced zero matches, and the details link opened property 2. Guest favorite saving preserved the complete filtered return URL through login. Saves survived reload and appeared on Home/Favorites; removal in Favorites propagated back to Listings. A second account did not inherit the first account's saved property. Application console error lists were empty. Local server logging recorded 18 catalogue requests, all HTTP 200. The only failed local request was the unrelated default `/favicon.ico` (404); there is no packaged favicon, and it does not affect property loading. No data/module/fragment request failed. This does not diagnose a different deployment/browser environment.

Files changed: `js/shared/property-data.js` (new), `js/core/component-loader.js`, `js/pages/home.js`, `js/pages/properties.js`, `js/pages/favorites.js`, `js/pages/auth.js`, `js/shared/detail-ui.js`, `tests/homepage.test.mjs`, `tests/property-data.test.mjs` (new), and this guide. No application HTML/CSS, fixture records, permission rules or original source files were changed in this pass.
