# وسيط — Implementation roadmap

This phase restores documentation only. Application code begins after the user's approval. Preserve the original Figma Make source and prepare a separately agreed location for the future HTML/CSS/vanilla JavaScript implementation.

## Proposed target organization

| Location | Responsibility |
|---|---|
| index.html | Public home entry |
| pages/ | Public, account and admin pages |
| components/ | Shared markup patterns suitable for later MVC partials |
| css/ | Tokens, base typography, shared components and page layouts |
| js/ | Navigation, rendering, state and interaction modules |
| assets/ | Approved imagery, icons and fonts |
| data/ | Fictional ERD-compatible records and separately identified UI scenarios |
| docs/ | These six planning files |

The existing root index.html is part of the Figma Make source. Select an isolated target directory before implementing this structure so source assets and entrypoints remain preserved.

## Ordered delivery and acceptance

| Stage | Work | Completion criteria |
|---|---|---|
| 1. Reconcile design and contracts | Inspect rendered public, account and admin views. Resolve dark-green discrepancy, missing states and role boundaries. Prioritize G01–G12 | Approved page inventory and explicit decisions for publication, renewal, contact sourcing, agency access and unsupported prototype fields |
| 2. Shared foundation | Arabic RTL shell, Cairo, approved color tokens, navigation, buttons, forms, dialogs and fictional records | Readable at reference breakpoints, keyboard navigation works, lookups resolve and source remains preserved |
| 3. Public discovery | Home, search/results, advanced filters, details, gallery and advertiser profile | Search → filter → details → Back retains context. Invalid IDs, zero results, missing media and unpublished/expired eligibility work |
| 4. Seeker and contact actions | Account access demonstration, favorites, phone/WhatsApp and report entry | Demo persona owns its saved list. Supported contact targets are valid and safe. Report feedback is connected to a fictional admin scenario |
| 5. Publisher and admin publication | Account inventory, add/edit form, private detail, admin review queue and decision view | Pending listing is private, approval exposes eligible content, rejection shows an outcome. Edit review follows the agreed visibility rule |
| 6. Manual renewal | 30-day renewal request, confirmation, expiry presentation and scoped actions | Explicit action renews according to agreed timing/review rules. Repeated action has one result, and expired/public states stay consistent |
| 7. Agency and employee work | Agency profile, employee list/editor, scoped assignment and agent inventory | An employee sees only authorized work. Reassignment or deactivation updates affected screens according to the agreed contract |
| 8. Verification, moderation and notifications | Verification request/review, report processing, account moderation, in-app lists, email previews and preferences | Each demonstrated decision updates its target and relevant recipient scenario. Read state, missing targets and review feedback work |
| 9. Verification and MVC handoff | Compare rendered pages to Figma, exercise mobile/keyboard paths, review data boundary and all requirements | Complete public, seeker, publisher, agency/agent and admin journeys pass. Hand off view/partial boundaries, fixture contracts and unresolved backend gaps |

Notification presentation can be scaffolded with the shared components, then connected as each workflow becomes available. Renewal depends on agreed review and timing rules. Employee management depends on an explicit agency/agent ownership contract.

## Frontend demonstrations and backend ownership

Fictional fixtures support existing ERD entities. Pending backend capabilities use clearly identified UI scenarios. Frontend controls demonstrate authorization-dependent visibility, while a future backend must enforce real permissions. Real authentication, uploads, persistent moderation, authoritative expiration, notification storage and email delivery belong to that integration.

Do not present an email preview as a delivered email or a WhatsApp click as a completed conversation. Follow the agreed storage duration for demo state and provide a reset path.

## Acceptance coverage

- Every interface, label, status and error reads in Arabic with RTL layout and Cairo.
- Geography and content consistently identify Sadat City, Menoufia, Egypt.
- Owner, Broker, Agency, Agent, Property Seeker and Admin journeys each have scoped navigation and sample data.
- Phone and WhatsApp are the listing-contact actions.
- Public eligibility requires admin approval and the agreed active term.
- Renewal is manual and covers 30 days according to the approved contract.
- Search and advanced filters operate only on supported data and handle empty results.
- Agency employee access, verification, reports and notifications have end-to-end fictional scenarios.
- Featured listings and property comparison are absent from the MVP implementation plan.
- No inferred database fields are included in the ERD contract. G01–G12 remain explicitly tracked until resolved.
- The plain frontend can be mapped into MVC layouts, partials and view models while keeping original Figma source intact.

## Current documentation verification

The six expected documents are PROJECT_OVERVIEW.md, DESIGN_SYSTEM.md, PAGE_INVENTORY.md, COMPONENTS_PLAN.md, ERD_TO_UI_MAPPING.md and IMPLEMENTATION_ROADMAP.md under docs/. Current analysis includes local source inspection. Browser behavior, visual fidelity and backend contracts require verification during their corresponding future stages.
