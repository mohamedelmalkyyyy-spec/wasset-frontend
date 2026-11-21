# وسيط — Components and JavaScript plan

Implementation will use semantic HTML, CSS and vanilla JavaScript after approval. Reusable markup should translate into MVC layouts and partials. Keep record lookup, display formatting, mock state and DOM events understandable and independent of any framework.

## Shared components

| Component | Consumers | Data and interaction |
|---|---|---|
| Brand, public header and footer | Public pages | Current destination, account state, RTL mobile menu and accessible navigation |
| Account/admin sidebar and topbar | Account and admin | Role-scoped links, current screen, notification entry and compact drawer |
| Search panel | Home and results | Keyword, sale/rent, area and category/type. Submit to results using URL parameters |
| Advanced filter panel | Results | ERD-backed price, size, bedrooms, bathrooms, floor, finishing and rent period where applicable |
| Property card | Home, results, favorites, advertiser | Property summary, resolved type/area, main photo, price and save control |
| Gallery | Detail and editor | Ordered images, cover selection, thumbnail navigation, keyboard controls and missing-photo fallback |
| Price/specification group | Cards and details | Numeric display formatting and conditional fields for applicable property type |
| Advertiser/contact panel | Detail and advertiser profile | Identity, approved badge, affiliation, permitted phone and WhatsApp |
| Favorite control | Card and details | Current user/property pair, guest return path and synchronized state |
| Form fields and uploader preview | Listing, account, verification | Labels, validation, selected image/document previews and removal |
| Listing/status table | Account and admin | Search, filter, pagination, owned/assigned scope and allowed actions |
| Confirmation/review dialog | Renewal, approval, rejection, employee and report actions | Target summary, confirmation, feedback, focus management |
| Employee list and editor | Agency account | Fictional employee membership and permitted actions pending backend contract |
| Verification request/review panel | Account and admin | Request progress and evidence presentation pending backend contract |
| Report form/review panel | Property and admin | Issue description and resolution flow pending backend contract |
| Notification list/badge | Account and admin | Event message, read state, related destination and channel feedback |
| Empty/error/loading feedback | All data-driven screens | Arabic state text, retry/reset or next action |

## Search behavior

Keyword search uses title and description. Category resolves through property_types.category_id, and area resolves through properties.area_id. Advanced filters combine using AND across groups, with OR for multiple selected values within a group. Validate minimum/maximum ranges and reject invalid numeric input. Changing transaction or type clears incompatible choices.

Sort using supported values such as price, size or created_at. Treat created_at as record creation time. Publication-time sorting depends on a backend gap. Rental prices need rent-period context before meaningful comparison. Keep selections and page number in the URL, reset pagination after changing filters, and restore state on browser Back. Amenities, exact-location and other unsupported filters await data decisions.

## Contact and saved listings

Phone actions use an approved display number and tel target. WhatsApp uses an approved normalized number and an encoded listing reference. The ERD explicitly stores WhatsApp only on broker_profiles. Owner and agency WhatsApp sourcing remains unresolved. A click cannot establish successful contact or delivery.

Favorites use the existing user_id/property_id pair. Avoid duplicate additions, synchronize controls and show a recovery state if a saved listing is no longer public. Demonstrations use fictional account context and a documented reset mechanism.

## Listing lifecycle and review

Submitting a listing produces pending review presentation. Admin approval makes the eligible listing public, and rejection keeps it private with an outcome. Exact stored status values are pending. Agent operations depend on agency permissions and assignment decisions.

Renewal requires an explicit action and covers 30 days. Show the target listing, confirmation and resulting request state, and prevent accidental duplicate submission. Agree the start date, early-renewal behavior, expiry visibility and whether renewal needs another admin review. Creation and update timestamps cannot substitute for an authoritative expiry history.

The source shows proposed edit review. Confirm whether the last approved version stays public while edits are pending. The demo must clearly maintain whichever rule is approved across public and admin views.

## Agency, trust and notifications

Employee management covers viewing employees, adding/editing permitted access and changing active state. Assignment and removal consequences require agreed rules. Prevent a persona from seeing another agency's private mock records.

Verification and report forms can demonstrate validation, evidence preview, submission feedback and admin decisions with fictional scenarios. Evidence upload limits, document requirements and moderation reasons are backend/product decisions.

In-app notifications need empty/unread/read states, filters and valid destination handling. Email notification demonstrations can show a template preview and a fictional delivery outcome. Real sending, retries, preferences and event persistence require backend support. Notification wording must distinguish a request received from a final approval.

## Demo and integration boundary

Use fixtures matching the supplied ERD for supported records. Represent unsupported workflows as clearly named UI scenarios documented as pending contracts, without declaring new database entities or columns. Store no password hashes or real verification documents in fixtures. Use browser-memory state initially and confirm persistence requirements before implementation.

Use stable page IDs, semantic form names and predictable event handlers. A future MVC team should replace mock providers with view models and server actions while retaining the approved markup and styling. Server-side authentication, permission checks, authoritative approval, scheduling, storage and email delivery belong to that integration.
