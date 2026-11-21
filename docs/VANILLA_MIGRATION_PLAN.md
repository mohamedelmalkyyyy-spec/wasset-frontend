# وسيط — Vanilla frontend migration plan

Prepared on 19 November 2026. This document is the migration proposal for review before coding.

## 1. Workspace findings and governing requirements

The workspace was inventoried before source inspection. The target directory is now explicitly frontend/. This resolves the target-location question in the approved roadmap.

| Existing location | Observed contents | Migration treatment |
|---|---|---|
| docs/ | Six approved planning documents | Read as requirements and retain verbatim |
| src/App.tsx | 1,569 lines. Public views, account entry, public fixtures, icons and top-level state navigation | Reference for public HTML, CSS and behavior |
| src/Dashboard.tsx | 2,195 lines. Four publisher personas, ten view states, listing wizard, employee and account tools | Reference for account pages and dialogs |
| src/Admin.tsx | 1,756 lines. Fourteen admin view states, review decisions and administrative fixtures | Reference for admin pages and dialogs |
| src/index.css | 262 lines, including long compound rules. Public layouts, tokens, Cairo import and Tailwind import | Extract tokens/base/shared styles and public CSS into frontend/ |
| src/dashboard.css | 2,897 lines. Account layouts, tables, wizard and responsive behavior | Adapt into isolated account stylesheet |
| src/admin.css | 24 long lines. Admin layouts, review panels and responsive behavior | Expand into readable, isolated admin CSS |
| src/main.tsx and src/vite-env.d.ts | React mount, global style import and Vite types | Reference-only framework entry |
| public/ | favicon.svg only | Audit favicon identity before use. Property photography is remote |
| .figma/ | README, site metadata, development configuration and toolchain/deployment scripts | Preserve as original Figma project configuration |
| Root index.html | Vite root element, TypeScript entry and Figma metadata placeholders | Preserve. New entry will be frontend/index.html |
| package.json, pnpm-lock.yaml, vite.config.ts, tsconfig.json, .mise.toml | React 19, Vite 8, TypeScript, Tailwind v4, pnpm and Figma build integration | Preserve original project tooling |
| frontend/ | Absent at inspection | Proposed future implementation location |

All eight files under src/ were read in full, including the three complete view implementations and all CSS rules. The entry/configuration files and .figma scripts were also inspected. The original runtime has not been built or exercised in a browser during this analysis. Source-derived layout observations therefore need rendered comparison during implementation.

The following approved documents were read in full.

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) establishes scope, roles and journeys.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) establishes identity and design constraints.
- [PAGE_INVENTORY.md](PAGE_INVENTORY.md) establishes destinations and required states.
- [COMPONENTS_PLAN.md](COMPONENTS_PLAN.md) establishes reusable controls and browser behavior.
- [ERD_TO_UI_MAPPING.md](ERD_TO_UI_MAPPING.md) establishes the eleven original entities and gaps G01–G12.
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) establishes sequencing and acceptance.

The target uses HTML5, CSS3 and vanilla JavaScript. Arabic RTL, Cairo, Desert Modern styling and Sadat City, Menoufia, Egypt remain the identity. Required actors are Owner, Broker, Agency, Agent, Property Seeker and Admin. Required workflows include phone/WhatsApp contact, search, favorites, publication approval, manual 30-day renewal, employees, verification, reports and in-app/email notification demonstrations. Featured listings and property comparison are excluded from MVP.

AGENTS.md describes the existing React/Tailwind scaffold. The user's explicit Vanilla migration instructions govern frontend/. This task adds this plan only. Implementation, including asset copies into frontend/, awaits approval.

## 2. Source architecture and migration approach

App uses useState for page and saved IDs, with useMemo choosing its content. Dashboard and Admin each have their own state-based navigation and independent fixtures. There is no URL router or shared domain state. Public detail always selects listings[0]. Account detail also selects the first property. Admin list rows navigate to generic details without passing an item identity.

The source contains 30 content view states when the Dashboard/Admin wrapper entries are expanded into their children. That count comprises six public/auth states, ten account states and fourteen admin states. Auth additionally contains login, registration and phone-code substates. Add and edit reuse the same five-step form.

The proposal maps these to 29 HTML documents. Add/edit share one document with explicit mode and item context. Auth keeps its three substates within one document. Existing galleries, drawers and dialogs remain attached to their owning pages. Missing designs are listed in section 9.

### Routing and browser state

- Use real anchors for page navigation and buttons for local actions. Resolve property, advertiser, user, agency and review context from validated URL parameters.
- Carry listing filters, sort and pagination in the URL. A sale/rent navigation link must supply its transaction choice. Category and area cards supply their respective filter values.
- Use one supported-record dataset for public and private views so cards, detail pages and approval results refer to the same item.
- Replace useState with small page-local state objects and event listeners. Replace useMemo with explicit derivation of filtered records, counts and current selections.
- Retain entered wizard values across all five steps. Unmounting JSX sections currently loses uncontrolled field values.
- Prefer semantic HTML already present in each document for stable content. Use HTML templates for repeated cards/rows and shared fragments for shells. Use textContent or safe DOM assignment for user-provided values.
- Use native JavaScript modules and an ordinary static HTTP server for fragment/data loading. Root Vite configuration and scripts remain the original reference infrastructure.

A storage decision needs approval with this plan. The approved component plan initially specifies browser-memory state. Full HTML navigation resets that state. Proposed migration behavior uses tab-scoped sessionStorage for non-sensitive demo identity, favorite IDs, approved mock workflow changes and preferences, with a reset action. Passwords, verification documents and binary uploads stay out of persistent browser storage. File previews remain in memory while their page is open. Final storage semantics must be agreed before implementing cross-page journeys.

### HTML and CSS translation

Convert JSX markup into ordinary elements, class attributes, label associations and native SVG attributes. Remove React imports, types, hooks and JSX expression syntax from the new frontend. Replace array maps with template cloning or concise DOM rendering, and convert inline event callbacks into named handlers in page modules.

Keep existing class names and layout geometry where practical. Load shared styles followed by the single relevant public, account or admin stylesheet. Some public controls use tag-specific button selectors. Add matching anchor selectors when navigation becomes links so their appearance stays consistent.

## 3. Exact public-page strategy

All destinations in the following tables are relative to frontend/. Source references identify component starting lines in the inspected snapshot.

| Destination and Arabic screen | Source | Preserve | Conversion and required completion |
|---|---|---|---|
| index.html — الرئيسية | App.tsx Home at 466, Header at 270, Footer at 1485 | Split hero and arched image, search panel, five category tiles, latest listings, four area tiles, three explanatory steps, advertiser CTA and trust section | Render ordinary recent listings from shared fixtures. Wire category/area/sale/rent anchors to results with parameters. Route add-property actions to the approved account entry/form. Preserve section order and CSS illustration |
| pages/properties.html — العقارات | App.tsx Listings at 801, SearchPanel at 352, FilterSidebar at 721 | Sand heading, compact search, desktop filter rail, mobile bottom drawer, applied chips, grid/list switch and pagination | Replace decorative fields with styled inputs/selects. Implement supported filter logic, sort, reset, removable chips, real result count and pagination. Current 43-result label and chips are static. Keyword input and additional ERD filters need placement decisions |
| pages/property.html — تفاصيل العقار | App.tsx Details at 923 | Breadcrumb, title/actions, three-slot gallery, price/specification panel, prose, amenity/location sections, related cards, sticky advertiser panel and mobile contact bar | Resolve item by ID. Connect save, gallery previous/next and supported sharing behavior. Use actual image count. Connect approved phone/WhatsApp targets. Keep report entry pending its missing form design. Payment methods, amenities, response-time claim and location behavior require gap resolution |
| pages/favorites.html — المفضلة | App.tsx Favorites at 1149 | Saved card grid, count and existing illustrated empty state | Resolve current user's saved pairs, synchronize remove/save, and preserve browse recovery action. Define unavailable/expired saved-card treatment before adding its missing state |
| pages/advertiser.html — ملف المعلن | App.tsx Advertiser at 1204 | Agency avatar/header, verification badge, contact buttons, about block and listing grid | Bind advertiser identity and related eligible listings. Source supplies one agency design and a slice of four unrelated fixtures. Owner/broker profile differences require confirmed content and data mapping |
| pages/auth.html — الدخول / إنشاء حساب / تأكيد الهاتف | App.tsx Auth at 1272 | Dark-green side panel, login form, four registration role cards, registration fields and six-digit phone-code state | Use three local panels, explicit validation and return destination. Wire show-password and OTP input behavior only within approved demo semantics. Source login always opens owner dashboard, role selection does not set account identity, and code resend is static. Recovery and real identity verification remain gaps |

Auth modes can be addressed by a validated mode parameter. Agent onboarding is represented by the agency employee dialog. The source provides no Agent/Admin public registration card. The separate admin demo-entry control is a prototype access mechanism requiring explicit demo treatment.

The home explanatory copy says «قارن واختار المناسب» and site metadata mentions comparison. These strings need reconciliation with the approved exclusion before porting. The latest-listings section does not implement a featured-listing system. Admin comparison of current and proposed edits remains an approved moderation screen.

## 4. Exact account-page and dialog strategy

Account pages use the shared source shell at Dashboard.tsx 2141, Sidebar at 391 and DashboardHeader at 339. Source personas are owner, broker, agency and agent. Labels vary by persona. Settings is currently offered in the agency sidebar only, and verification is omitted from the agent sidebar.

| Destination and screen | Source | Preserve | Conversion and required completion |
|---|---|---|---|
| pages/account/index.html — لوحة الحساب | Overview at 540 | Five status summary cards, agency summary when applicable, recent-property table, quick actions and expiry notice | Compute counts and scoped inventory from the same mock records. Card links carry status filters. Source totals are illustrative and agent overview is a slice of the same data |
| pages/account/properties.html — عقاراتي / عقارات المكتب / العقارات المسندة لي | Properties at 792, PropertyTable at 687 | Search toolbar, status tabs and counts, table/mobile cards, renewal and assignment controls, empty state and renewal toast | Keep functioning title/status filtering and add item-aware links. Implement agreed ownership/assignment scope. Sort is currently inert. Scope permissions before displaying edit/renew controls |
| pages/account/property-form.html — إضافة / تعديل عقار | PropertyForm at 1000, Stepper at 969 | Five steps, edit warning, upload preview, review card, footer and success state | Use create mode or edit mode with an item ID. Store every field during step changes, prepopulate selected item, validate agreed constraints, order/delete photos and choose cover. Submission creates a pending demo outcome. Draft saving is a designed button with no behavior |
| pages/account/property.html — تفاصيل الإعلان | DashboardPropertyDetails at 1459 | Image/title/price summary, specification grid, timeline, availability control, pending changes and rejection history | Resolve item by ID. Model publication, availability and pending edits separately at the UI contract boundary. Dates, availability and review history depend on G03–G05/G10 |
| pages/account/employees.html — إدارة الموظفين | Employees at 1586 | Employee cards/list, search, assigned counts, add-employee dialog and four permission toggles | Scope by agency. Read actual entered email/phone and selected active/invitation options in the demo. Store permissions per employee. Source adds fixed contact values and shares one permission array across employees. Employee search and more-menu are inert |
| pages/account/verification.html — توثيق الحساب | Verification at 1776 | Status panel, email/phone/document rows, uploader, pending state and rejection example | Show actual selected-file metadata and validate approved file rules. Keep fictional evidence private to the demo context. Rejection is currently an always-visible example, and uploaded filename/size are hard-coded |
| pages/account/notifications.html — الإشعارات | Notifications at 1899 | All/unread tabs, list, action links, read indicator and mark-all | Retain read-state behavior and connect action targets by ID. Drive both header and sidebar counts from state. Source sidebar count is hard-coded and action buttons lack navigation |
| pages/account/profile.html — الملف الشخصي / ملف المكتب | Profile at 1987 | Avatar/logo panel, contact fields, about text and agency document statuses | Load persona-appropriate supported fields, validate and preview approved edits. Save/avatar controls are inert. User address/bio and company email/bio are not uniformly covered by the ERD |
| pages/account/settings.html — إعدادات الحساب | Settings at 2063 | Email and expiry notification toggles, password-change entry | Implement agreed demonstration preferences. Source has native checkbox changes only. Password-change panel is missing. Confirm access for Owner, Broker, Agent and Seeker |

### Five-step form mapping

| Step | Existing design | Data and migration decision |
|---|---|---|
| 1. المعلومات الأساسية | Title, transaction radios, category, subtype and description | Map to title, listing_type, property_type_id and description. Category is resolved through the type. Replace approximate source options with agreed lookup fixtures |
| 2. المواصفات | Price, size, payment method, conditional rooms/bathrooms/finishing/floor and amenities | Existing ERD supports numeric price/size and listed specifications. Payment and amenities need G10 resolution. Rent-period control is absent despite rent_period in the ERD |
| 3. الموقع | Disabled Sadat City, district select, free-text area/address and illustrated map/geolocation entry | areas supports area_id selection. Free-text location hierarchy, property address and drag/geolocation behavior need decisions. Existing map is CSS decoration |
| 4. الصور | File picker, drag instruction, previews, move-up and delete controls, first image as cover | Map ordered images to property_images semantics. Implement actual drag/drop only if retained, validate approved size/type limits and revoke object URLs when removed |
| 5. المراجعة | Summary card, selected type, image count and review note | Populate all values from saved form state. Existing price/area/transaction summary includes placeholders or fixed values. Submit to pending scenario and update related private/admin views |

The source displays 2,000-character guidance without enforcement, 10 MB image guidance without validation, and validates only a nonblank title before step 2. These are source observations, with final constraints tracked under G12 and the existing ERD decisions.

### Existing dialogs and attached states

- Renewal dialog belongs to the property list. It currently closes and shows a request toast without changing expiry or status. Preserve its wording/layout, then apply the approved 30-day timing and review rules. No dedicated admin renewal queue is designed.
- Assignment dialog belongs to agency inventory. It currently includes all seed employees, including an inactive employee, and closes without recording the selection. Agree employee eligibility and assignment behavior.
- Employee creation and permissions dialogs belong to employee management. Invitation acceptance and temporary-password setup have no destination design.
- The shared Modal component at 2112 supplies account overlays. Preserve its centered desktop and bottom-sheet mobile presentation while adding keyboard focus, Escape and labelled-dialog semantics.
- Account success, empty-results and toast presentations already exist. Use those patterns only for their supported contexts until other states are approved.

## 5. Exact admin-page strategy

All admin destinations use the source shell and navigation at Admin.tsx 1558. Each review must resolve the selected target, retain its own status and apply decisions to that item. The existing source has one global status per workflow and changes the first queue row.

| Destination and screen | Source | Preserve | Conversion and required completion |
|---|---|---|---|
| pages/admin/index.html — لوحة الإدارة | DashboardHome at 430 | Four summary cards and latest listings, verification and reports panels | Derive counts and item-aware links from shared demo scenarios |
| pages/admin/listings.html — مراجعة الإعلانات | Listings at 542, Filters at 360 | Filters and seven-column review table | Wire search/type/transaction/advertiser/date controls. Use actual queue counts and carry listing ID. Date filtering needs an agreed submission-time contract |
| pages/admin/listing.html — مراجعة إعلان | ListingDetails at 604, ActionBox at 724 | Gallery, title/specifications/prose, advertiser card and decision panel | Resolve listing/publisher, wire full gallery and advertiser link, and connect approve/reject to one pending item |
| pages/admin/edits.html — مراجعة التعديلات | Edits at 760 | Queue with changed-field chips and review entry | Render pending edit scenarios and route to the corresponding review |
| pages/admin/edit.html — مراجعة التعديلات المقترحة | EditComparison at 810, CompareContent at 885 | Current/proposed panels for price, description and photos, changed markers and sticky decisions | Keep the approved content visible until the agreed review outcome. Source explicitly describes this behavior. Contract/storage remains G04 |
| pages/admin/users.html — المستخدمون | Users at 912 | Search/role filter and account table | Connect filtering and per-user detail links. Status changes must target selected user |
| pages/admin/user.html — تفاصيل المستخدم | UserDetails at 977 | Profile summary, account metrics and suspend/reactivate confirmation | Bind account data and activity scenario. Last login and proven-report counts exceed current ERD coverage |
| pages/admin/agencies.html — المكاتب العقارية | Agencies at 1049 | Agency card grid, owner/contact/counts and badges | Bind selected company and agreed membership data, derive counts and route by agency ID |
| pages/admin/agency.html — تفاصيل المكتب | AgencyDetails at 1090 | Agency summary, information, verification documents and employee roster | Resolve selected agency. Ownership, founding year, company email and private documents require gap contracts |
| pages/admin/verification.html — طلبات التوثيق | Verifications at 1171 | Applicant/type/date/document-count/status table | Use one row per scenario and navigate to selected request |
| pages/admin/verification-request.html — مراجعة طلب التوثيق | VerifyDetails at 1227 | Private-document list, applicant summary, preview error/retry and decision panel | Bind applicant and fictional evidence. Source simulates failure on the third preview button and supplies no successful document viewer |
| pages/admin/reports.html — البلاغات | Reports at 1300 | Report ID, property, reporter, reason, date, state and review table | Bind report scenarios and selected detail. Real report storage is G07 |
| pages/admin/report.html — مراجعة البلاغ | ReportDetails at 1352 | Report content, referenced property and action panel | Connect listing-review link, resolve/close and approved listing suspension action. Suspension button currently has no handler |
| pages/admin/notifications.html — الإشعارات | Notifications at 1441 | Notification list, unread indicators, mark-all and navigation | Preserve read/open behavior, add item context and align recipients with workflow decisions. Channel text currently claims in-app/email presentation without a delivery mechanism |

Dialog at Admin.tsx 1495 supports approval, rejection, resolution, closure and account status confirmation. Rejection requires nonblank reason before confirm. Persist the reason in the approved UI scenario so the publisher sees it. Current code discards it after the toast. Keep confirmation and result styling, add focus management, and ensure repeated confirmation cannot duplicate an outcome.

Empty at Admin.tsx 407 contains five empty-state copy variants but is never invoked. Connect these existing states when queues become empty. Admin ActionBox uses listing-publication wording even when reused for verification, which needs context-specific copy approval.

## 6. Reusable component and stylesheet extraction

| Source components | Proposed destination/responsibility | Migration detail |
|---|---|---|
| Logo, Header, Footer | components/public-header.html and public-footer.html with js/shared/navigation.js | Preserve public logo construction and mobile navigation. Use destination anchors and accessible expanded/current states |
| DashboardLogo, Sidebar, DashboardHeader | components/account-shell.html | Retain account shell and approved role-dependent links |
| Admin shell markup | components/admin-shell.html | Retain separate admin sidebar, header and active parent navigation |
| Icon, DIcon, admin Icon | components/icons.html | Preserve existing 24×24 SVG geometry, currentColor and 1.8 stroke. Deduplicate only identical geometry. Same-name icons can differ |
| SectionTitle, PageHeading, Heading | Corresponding page markup and css/components.css | Share typography helpers where visual parameters match, preserve public/account/admin variants |
| PropertyCard | components/property-card.html and js/shared/property-cards.js | Repeated template with actual record ID, public eligibility and independent favorite button |
| SearchPanel and FilterSidebar | Public search templates and js/pages/properties.js | Share state with URL and result rendering, retain source desktop/mobile presentation |
| PropertyTable | components/property-table.html | Preserve account table and data-label mobile cards with scoped action rendering |
| StatusBadge and Badge | js/shared/status.js with CSS variants | Maintain different workflow meanings. Account «منشور» and admin «موافق عليه» need consistent mapping at the presentation boundary |
| Modal and Dialog | js/shared/dialog.js plus owning-page templates | Reuse lifecycle behavior while retaining account/admin visuals |
| Stepper and PropertyForm | js/account/property-form.js and page-local templates | Retain five steps, explicit state and photo-preview lifecycle |
| ActionBox and CompareContent | Admin page templates plus js/admin/review.js | Reuse decision handling for supported targets with appropriate contextual copy |
| Notifications in both shells | Separate list templates with common state operations | Preserve differing layouts and unify unread/count updates |
| Empty, feedback and upload controls | Shared behavior and existing local visual variants | Reuse only inspected states. Record absent designs before building them |

### CSS migration details

The UI is styled primarily with handwritten semantic classes. Tailwind is imported in src/index.css, so removing its import also removes its reset/default behavior. Add an explicit base stylesheet covering box-sizing, default margins, inherited form fonts/colors, button/input defaults, table spacing, images/SVG display and heading defaults needed by this design. Check computed styles against the original before concluding parity.

Proposed load order is fonts.css, tokens.css, base.css, components.css, then public.css, account.css or admin.css for that page. Keep media rules adjacent to their relevant stylesheet. The new frontend must be readable without Tailwind processing or React runtime.

Shared selector names currently collide across the eagerly imported stylesheets. Examples include .employee-list, .verification-layout, .notification-list, .notification-icon, .icon-action and .modal-actions. Isolate account/admin selectors beneath their shell or load only the appropriate page family. Keep intentional shared rules in components.css.

Retain the approved colors, Cairo weights, card radii, shadow definitions and CSS-generated logo/illustrations. The documented source dark green #536D37 differs from approved #526B38. Use the approved token in the target, and flag its visible effect in visual review. Additional subtle surface/status colors should follow the source.

| Family | Existing responsive rules | Verification focus |
|---|---|---|
| Public | 900px, 620px | Header drawer, grids, horizontal area cards, bottom filter drawer, single-image mobile gallery, contact bar and auth side panel |
| Account | 1050px, 800px, 600px | Sidebar drawer, stat strip, table-to-card transformation, one-column forms, image grid and bottom-sheet dialogs |
| Admin | 1050px, 780px, 480px | Sidebar drawer, stacked details/edit panels, horizontally scrollable tables and review actions |

Source rules hide the previous-step action below 600px and progressively hide admin filters. Preserve access to required tasks through an approved responsive treatment before considering these screens complete. Source also hides some button text, so Arabic accessible labels must survive compact layouts. Verify focus rings, reduced-motion behavior, modal focus, background inertness and sufficient space above the fixed contact bar.

## 7. Asset and font audit

The workspace contains one physical image asset, public/favicon.svg. It is a 16×16 SVG with a dark background and white mark from the Make scaffold. It differs from the CSS-rendered Waseet brand mark, so favicon selection needs confirmation. No local photographic files, font binaries, verification PDFs, uploaded documents or separate icon package are present.

Ten unique Unsplash photographs are referenced through nineteen distinct image URLs across the three TSX files. All ten App image URLs were downloaded to a temporary inspection folder outside the project and visually inspected. They loaded successfully. The table records decoded dimensions from those responses. Dashboard/admin use alternate width/quality queries on the same photo IDs, whose individual transformed responses were not separately decoded.

Every image URL uses https://images.unsplash.com/photo- followed by the identifier below and query parameters auto=format, fit=crop, w and q.

| Source key / photo identifier | App query width / quality and decoded size | Source placements and observed content |
|---|---|---|
| hero / 1790198576345-f1f1af9d458b | 1800 / 88, 1800×1440 | Hero and third-area card. Modern white house on rocky desert terrain |
| apartment / 1705321963943-de94bb3f0dd3 | 1200 / 85, 1200×667 | Apartment cards/category, public detail, account listing and admin review. Light residential living room |
| villa / 1568899380839-bba35e99fbe3 | 1200 / 85, 1200×1600 | Villa card/category, distinguished-area tile, admin queue. Terracotta residential exterior with palms |
| shop / 1600210492486-724fe5c67fb0 | 1200 / 85, 1200×900 | Commercial card/category, account/admin lists. Furnished residential living room |
| office / 1689043528099-2ba014dd7c64 | 1200 / 85, 1200×960 | Office card/category and account list. Residential kitchen/dining interior |
| land / 1780303009859-c08cdf9c4f4c | 1200 / 85, 1200×1740 | Land card/category and account list. Building in a sandy desert setting |
| district1 / 1568898670347-1d70723b65f5 | 1000 / 85, 1000×1333 | First-area card. White residential building |
| district2 / 1546276933-ba48bfdf5d82 | 1000 / 85, 1000×750 | Second-area card. Urban apartment facade |
| interior2 / 1564078516393-cf04bd966897 | 1000 / 85, 1000×1500 | Rental apartment card, public gallery, admin gallery/edit review. Tall living-room interior |
| interior3 / 1729086046027-09979ade13fd | 1000 / 85, 1000×1032 | Public gallery and admin gallery/edit review. Living-room interior |

Dashboard references apartment, shop, land and office at w=500&q=80. Admin references apartment at w=900&q=82, interior2/interior3 at w=700&q=82, and shop/villa at w=400&q=80.

Proposed implementation copies the exact approved images into frontend/assets/images/ with descriptive filenames, retaining crop/position rules and recording their source URLs in data/assets.json. Preserve the source placements during migration. The shop/office photo mismatch and the lack of verified Sadat City provenance are content-review items. The home area section already describes imagery as illustrative. Asset rights/local-bundling approval remain to be confirmed before packaging.

Cairo loads through the Google Fonts CSS endpoint with weights 400, 500, 600, 700 and 800 and display=swap. The fallback is sans-serif. There are no @font-face declarations or local fonts. The plan proposes licensed local Cairo files under assets/fonts/ with equivalent weights and Arabic/Latin coverage. Exact font files, license and glyph rendering require verification before adopting local hosting. The font endpoint/binaries were inventoried from source, not fetched in this audit.

Icons are inline SVG definitions in the three TSX files. Logos, avatar initials, decorative arches, sun/building illustration and map graphics are HTML/CSS constructions. They can be migrated directly. The map is a visual placeholder with no mapping provider. Verification filenames and document sizes are text fixtures, with no evidence files to copy.

## 8. Proposed frontend/ structure

The following tree describes future deliverables only.

~~~text
frontend/
  index.html
  pages/
    properties.html
    property.html
    favorites.html
    advertiser.html
    auth.html
    account/
      index.html
      properties.html
      property-form.html
      property.html
      employees.html
      verification.html
      notifications.html
      profile.html
      settings.html
    admin/
      index.html
      listings.html
      listing.html
      edits.html
      edit.html
      users.html
      user.html
      agencies.html
      agency.html
      verification.html
      verification-request.html
      reports.html
      report.html
      notifications.html
  components/
    public-header.html
    public-footer.html
    account-shell.html
    admin-shell.html
    icons.html
    property-card.html
    property-table.html
  css/
    fonts.css
    tokens.css
    base.css
    components.css
    public.css
    account.css
    admin.css
  js/
    shared/
      navigation.js
      fragments.js
      data.js
      demo-state.js
      format.js
      dialog.js
      status.js
      property-cards.js
    pages/
      home.js
      properties.js
      property.js
      favorites.js
      advertiser.js
      auth.js
    account/
      shell.js
      overview.js
      properties.js
      property-form.js
      property.js
      employees.js
      verification.js
      notifications.js
      profile.js
      settings.js
    admin/
      shell.js
      overview.js
      listings.js
      review.js
      users.js
      agencies.js
      verification.js
      reports.js
      notifications.js
  assets/
    images/
    fonts/
    icons/
  data/
    records.json
    scenarios.json
    assets.json
~~~

HTML documents own the page structure and local dialog/form templates. fragments.js loads the shared shell/templates relative to a known frontend base so nested page paths resolve correctly. Shell placeholders need useful failure handling if loading fails. Future MVC layouts/partials can consume the same markup after integration.

records.json contains fictional records using existing ERD field names. scenarios.json contains presentation scenarios for currently unsupported workflows and must be explicitly described as a frontend fixture contract. It establishes no database schema. assets.json maps source imagery to eventual target assets. icons/ is reserved for the selected favicon or approved external icon assets. Existing inline SVGs can remain in the shared HTML template.

Avoid a universal frontend framework or custom router. A static server serves these files without compiling JSX, TypeScript or Razor. No target package.json or changes to root tooling are required by this proposal.

## 9. Requirement coverage and decisions before affected work

| Approved requirement | Design support | Migration issue / existing gap |
|---|---|---|
| Arabic RTL and Desert Modern | Public wrapper, auth CSS, account/admin RTL shells, Cairo and palette | Set lang=ar and dir=rtl on every target document. Original root metadata has no language configured and defaults to English in Vite |
| Six roles | Four publisher personas, four registration cards, admin shell and seeker favorites | Seeker account layout missing. Agent/Admin public registration is absent. G01/G11 |
| Phone/WhatsApp | Contact panels and mobile contact bar | Inert buttons and no uniform WhatsApp source for every advertiser role. G09 |
| Admin approval | Submission, queue, decision and result designs | Connect currently independent records and per-item decisions. G03 |
| Manual 30-day renewal | Expiry notice, listing button, confirmation and request toast | No renewal schedule/history or admin request screen. Confirm timing and review semantics. G05 |
| Search/advanced filters | Search panel, filter rail/drawer, sorting/pagination and display switch | Most controls are decorative. Keyword placement, additional specification filters and rent-period UI need decisions. G10 |
| Agency employee management | Employee list, add/permissions dialogs and assignment dialog | Missing employee edit/deactivate outcome screens and real permissions/assignment. G01/G02 |
| Verification | Account upload/status, admin request list/review and preview failure | Successful evidence preview and final requirements are unspecified. G06/G12 |
| Reports | Public entry button, complete admin list/detail and resolve/close dialogs | Public submission/receipt design absent. Listing suspension action unimplemented. G07 |
| In-app/email notifications | Both notification centers, account preferences, channel labels and toasts | No email template/delivery screen or backend events. Seeker notification access unspecified. G08 |
| Favorites | Working in-memory toggle and empty state | User isolation and cross-page persistence require agreed demo state |
| Exclusions | No dedicated public comparison/featured screen | Reconcile comparison marketing copy. Keep existing admin edit-review comparison within moderation scope |

### Missing or incomplete designs

Record these for design review before implementing the affected behavior.

1. Public report form, validation, submission receipt and reporter follow-up.
2. Password recovery/reset and account password-change panel.
3. Seeker profile/settings/notification navigation and its shell.
4. Successful verification-document preview and invitation acceptance/temporary-password screens.
5. Employee edit, deactivate/remove confirmation and reassignment consequences.
6. Renewal rejection/approval detail or queue, if admin review is required.
7. Public invalid/unavailable/expired property presentation and saved-item treatment.
8. Search no-results/error/loading presentation. Source has a favorite empty state, account search empty state and unused admin Empty variants, but no complete public results empty design.
9. Email templates and delivery outcome presentation.
10. Terms/privacy destinations and footer social/support link targets.
11. Expanded mobile access to hidden admin filters and the wizard previous-step action.
12. Owner/broker advertiser variants and extra filters/keyword placement.

Additional prototype content requiring data decisions includes payment methods, amenities, availability, address text, response speed, company founding year/owner/email/about, user last login, separate phone/email verification, review timelines and evidence metadata. Existing gaps G01–G12 remain the backend decision register. Source fixture properties must not be promoted to database fields.

The source's edit warning, submission feedback and admin comparison explicitly keep current approved content public pending review. Use that as the observed design intent and confirm its contract under G04. Source upload sizes, reminder timing and OTP wording are design text requiring product/backend confirmation rather than inferred backend guarantees.

## 10. Implementation sequence after approval

1. Reconcile the specific design/data decisions affecting the first migration slice and approve the proposed navigation/storage approach.
2. Establish frontend/ shell documents, Cairo handling, tokens, explicit base CSS and scoped styles. Match existing logo, icons, spacing and responsive shell geometry.
3. Migrate home, property cards, results and detail together. Bind identities, filters and navigation while retaining source layouts.
4. Migrate advertiser, favorites and the existing auth substates. Add only approved contact behavior and account return paths.
5. Migrate publisher overview/list, the five-step create/edit form and private detail alongside admin listing review. Demonstrate a consistent pending → approval/rejection journey.
6. Migrate manual renewal and agency employee/assignment work after their timing and permission decisions.
7. Migrate the remaining admin user/agency/edit/verification/report screens, account verification/profile/settings and both notification centers. Complete missing screen designs before their corresponding flows.
8. Compare rendered pages and interactions with the original reference, verify the approved MVP matrix, and prepare frontend markup/data boundaries for future MVC integration.

### Acceptance and preservation checks

- Open each of the 29 proposed documents directly over HTTP. Validate all nested CSS, module, image and fragment paths.
- Exercise item-specific navigation, browser Back, filter persistence, auth return paths, independent favorites and account switching.
- Use one consistent fixture scenario to verify public visibility after review, current/pending edit behavior, manual renewal, employee scope, verification and report outcomes.
- Check actual data counts, notification badges, repeat-click handling and empty states.
- Compare representative widths of 1440px, 1024px, 768px and 390px, then test on both sides of each source breakpoint.
- Check RTL reading order, Arabic labels, mixed-direction values, keyboard access, focus restoration and image/font failures.
- Confirm target HTML/CSS/JS has no React/JSX, Tailwind build dependency, Razor or .NET code.
- Compare original-file hashes and the six approved documents against the recorded pre-analysis baseline. Only this new plan is added during the current task.

This plan is ready for review. Application migration starts after the user's approval.
