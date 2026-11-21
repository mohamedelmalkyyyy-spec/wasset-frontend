# Waseet — وسيط Vanilla Frontend

Approved Arabic RTL real estate marketplace frontend for Sadat City, Menoufia, Egypt. Built with HTML5, CSS3 and native JavaScript modules, Cairo typography and the Desert Modern palette. It is ready for ASP.NET Core MVC integration as a frontend demonstration; it contains no backend or real authentication.

## Run locally

From the repository root in PowerShell:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory frontend
```

Open `http://127.0.0.1:8765/index.html`. Stop with Ctrl+C. Choose another port if occupied. No installation or build is required. Use HTTP rather than `file://`; hard-refresh after edits. This command serves the Vanilla frontend independently of the repository's legacy build tooling.

## Completed functionality

- Public homepage, search/advanced filters, sorting, pagination, property details/gallery, advertiser profiles and related properties.
- Login/registration/phone-verification simulation, role-aware returns, logout and account-specific favorites.
- Owner and Independent Broker dashboards, scoped inventory, property add/edit, listing statuses, availability and manual 30-day renewal.
- Agency dashboard/inventory, employee addition, membership/permissions and property assignment; Agent dashboard and authorized assigned-property actions.
- Admin dashboard, listing/modification review, user/Agency management, suspension/reactivation, verification and reports.
- Account/Admin notification centers, unread indicators/read controls and explicitly unsent email-template previews.
- Shared Public, Account and Admin shells with Arabic RTL desktop/tablet/mobile behavior.

There are **34 application HTML pages**. The [mock data guide](MOCK_DATA_GUIDE.md) documents their shared accounts and populated workflows. Favorites and `pages/account/notifications.html` are shared by signed-in roles. There is no standalone Seeker dashboard. Employee permissions and reporting use dialogs within existing pages.

Contact is phone/WhatsApp only, enabled only for supplied valid values. Current public fixtures lack usable contact numbers. The location panel explains missing area coordinates/unapproved map service; no interactive map is integrated. Featured listings and property comparison are outside MVP. Profile/settings, password recovery and verification submission/upload have no implemented standalone pages.

## Structure

```text
frontend/
  index.html                  Homepage
  pages/                      Public/auth, account, broker, agency, agent, admin
  components/                 Public/account/admin fragments and shared patterns
  css/                        Tokens, typography, controls, layouts and page styles
  js/core/                    Component loader, path resolver and shell/dialog setup
  js/pages/                   Public/auth/favorites/notifications entry modules
  js/account/                 Owner/Broker/Agency/Agent controllers
  js/admin/                   Admin page controllers and queue/summary helpers
  js/shared/                  Cards, search, navigation, identity and workflow stores
  data/                       Property/lookups and presentation fixtures
  assets/                     Photo manifest, local SVG sprite and asset notes
  tests/                      Focused Node test suites
  preview/                    Development fixtures and historical review artifacts
```

`component-loader.js` loads trusted local fragments and displays an Arabic error if loading fails. `path-resolver.js` resolves paths relative to its module, supporting both root and `/frontend/` mounting. `shell-init.js` initializes navigation, active states, dropdowns and native dialogs. One sidebar moves between its desktop slot and mobile dialog. Admin CSS loads after shared Account shell CSS. Preserve existing `w-` classes, markup and CSS tokens during migration.

Search/filter state lives in URLs; detail/profile links preserve `id`, `from` and `back`. Authentication validates local return destinations and role boundaries. Publish directs eligible roles to their existing form; guests enter login. Property-form returns lead to the same role's inventory.

## Demo identities and storage

All six ready-to-use accounts use the demo password **`Demo@12345`**:

| Account | Email | Default destination |
| --- | --- | --- |
| User / Property Seeker | `elmalky@gmail.com` | Favorites |
| Owner | `elmalky-owner@gmail.com` | Owner dashboard |
| Independent Broker | `elmalky-broker@gmail.com` | Broker dashboard |
| Agency | `elmalky-agency@gmail.com` | Agency dashboard |
| Agent | `elmalky-agent@gmail.com` | Assigned-property dashboard |
| Admin | `elmalky-admin@gmail.com` | Admin dashboard |

The shared password is compared locally for these six identities; it is public demo configuration and is never stored in session account records. This is not real authentication. Other local registrations remain demonstrations. Agents use Agency membership rather than public Agent registration; Admin is not publicly registered. Phone verification still uses `123456`, without SMS. Never enter real credentials.

One-time population supplies **27 linked properties** (18 base records plus nine submissions), three publisher inventories, three employees, favorites, approval/edit queues, verification, reports and recipient-specific notifications. All six accounts have meaningful primary destinations. Existing compatible session changes are preserved, legacy fixture identities are migrated once, and reload never reseeds removed favorites, reviewed requests or changed permissions. See [Mock data guide](MOCK_DATA_GUIDE.md) for exact scenarios and storage behavior.

All persistence uses same-origin, same-tab `sessionStorage`: current identity/favorites, publisher proposals/images/renewals/availability, employees/assignments/permissions, moderation, suspension, verification, reports and notifications. It survives reload/navigation but is browser-editable, quota-limited and not shared durable multi-user storage. Uploaded images are data URLs. Admin pages are directly accessible demo previews. Never treat any of this as a production security boundary.

New listings require approval. Pending price/image/description edits preserve the last approved public version. Rejection requires a reason. Renewal is manual and adds 30 days from the later of now/current deadline; an edit approval does not renew. Agent access is assignment/permission scoped; suspension preserves existing ownership/assignments. These are demonstrated behaviors; authoritative persistence and all request authorization must be implemented server-side.

No real email, SMS, invitation delivery, private document file, API or database exists. Verification previews are clearly labelled mock metadata. Notifications are local events and email previews explicitly state that nothing was sent. UI journal fields and fixture attributes are not additions to the documented ERD.

## Assets and production handoff

Photographs remain remote; `assets/manifest.json` records their URLs. Cairo loads from Google Fonts with Tahoma/Arial fallbacks; no local font/photo binaries are bundled. SVG symbols are local in `assets/icons/source-icons.svg`. No approved branded favicon is packaged. Agree production asset hosting and any map provider separately; never fabricate contacts or coordinates.

`foundation-preview.html` and `preview/nested/index.html` are development-only documents, not production pages. Exclude them, the pattern gallery and review artifacts from the production route/deployment scope.

Convert approved markup to three Razor layouts and shared partials, serve static CSS/JS/assets from `wwwroot`, generate MVC routes, and replace fragment fetching/demo stores with ViewModels and authorized server operations. Keep the approved visual/interaction behavior. Do not copy session keys or presentation-only fields into a database schema.

## Handoff documents and verification

- [Mock accounts, linked scenarios and preservation rules](MOCK_DATA_GUIDE.md)
- [Design system](../docs/DESIGN_SYSTEM.md)
- [Component plan](../docs/COMPONENTS_PLAN.md)
- [Implementation roadmap](../docs/IMPLEMENTATION_ROADMAP.md)
- [Migration planning record](../docs/VANILLA_MIGRATION_PLAN.md)

Earlier work recorded a 74-test integration result. That full suite was not repeated for this population task and does not certify a future MVC backend. The earlier MVC handoff guide, frontend/backend contracts, ERD mapping, final audit and Integration Pass B notes are not present in the current workspace; their broken links have been removed. They were not recreated as part of mock population. Available planning documents remain unchanged.

Final mock population was verified separately with seven focused catalogue/store tests and browser sign-in checks for all six accounts. Browser checks also confirmed seeded Admin queues, Owner approval → public visibility after reload, favorite removal persistence and logout. No prior full integration suite was repeated. Earlier audit/handoff documents remain historical snapshots; this README and the mock data guide describe the populated demonstration.
