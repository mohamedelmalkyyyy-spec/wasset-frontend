# وسيط — Project overview

Recreated on 19 November 2026 from the latest user brief, original ERD attachment and locally available Figma Make source.

## Product and approved scope

وسيط is an Arabic RTL real estate marketplace serving Sadat City, Menoufia, Egypt. It helps property seekers discover listings and contact advertisers by WhatsApp or phone. The brand uses Cairo and the Desert Modern identity.

The target frontend uses HTML5, CSS3 and vanilla JavaScript with fictional demonstration data. Future integration is intended for an ASP.NET Core MVC team. The current repository contains the original React, Vite and Tailwind Figma Make prototype. Preserve that source as the design reference. This documentation task creates six Markdown files under docs/. Application implementation requires the user's approval.

| MVP requirement | Intended experience | Planning reference |
|---|---|---|
| Search and advanced filters | Search titles and descriptions, select transaction, category/type and area, constrain supported specifications | PAGE_INVENTORY, COMPONENTS_PLAN |
| Phone and WhatsApp contact | Listing and advertiser contact actions | COMPONENTS_PLAN, ERD_TO_UI_MAPPING |
| Admin approval before publishing | Publisher submits, admin reviews, approved listing becomes eligible for public display | IMPLEMENTATION_ROADMAP |
| 30-day manual listing renewal | Publisher explicitly requests renewal and sees pending, active or expired presentation | ERD_TO_UI_MAPPING |
| Agency employee management | Agency manages employees and their scoped listing work | PAGE_INVENTORY |
| Verification and reports | Request verification, report a listing, review requests and reports | ERD_TO_UI_MAPPING |
| In-app and email notifications | Show account events and email preferences/delivery demonstrations | COMPONENTS_PLAN |
| Favorites | Saved listings for signed-in seekers, retained from the original plan | PAGE_INVENTORY |

Featured listings and property comparison are excluded from MVP. The legacy is_featured database field does not authorize featured cards, promotion or sorting. Admin review of proposed edits remains part of the observed design workflow.

## Roles and proposed permission boundaries

The six role names are required. The following ownership boundaries guide frontend scenarios. Final server permissions and registration eligibility remain to be agreed.

| Role | Arabic label | Scope |
|---|---|---|
| Owner | مالك | Submit and manage own properties, request renewal, view own verification and notifications |
| Broker | وسيط عقاري | Submit and manage own brokerage listings, show broker profile and permitted contact details |
| Agency | مكتب عقاري | Manage agency-facing profile, employees and agency listing workflow within granted permissions |
| Agent | موظف مكتب عقاري | Work on listings assigned by the agency. Confirm creation, assignment, renewal and editing permissions |
| Property Seeker | باحث عن عقار | Browse, filter, save, contact and report listings, manage own account and notifications |
| Admin | مشرف | Review publication, edits, verification and reports, manage users/agencies within approved moderation rules |

Guest browsing is an access state. The supplied roles table contains id and name, and users has a single role_id. Actual role IDs, role switching and combined capabilities are unspecified. A company record alone does not establish an agency login or ownership relationship.

## Core journeys

1. A seeker searches, adjusts filters, opens a property, checks advertiser information and chooses phone or WhatsApp. Favorites support revisiting.
2. An owner or broker submits a listing for review. Approval makes it eligible for publication. Rejection shows a review outcome and a route to revise.
3. A publisher initiates manual renewal for a further 30-day term. Expiry and renewal are visible in the account area. Timing and review semantics need agreement before implementation.
4. An agency manages employee access and listing assignments. An agent sees only the work allowed for that employee.
5. A user requests verification or reports a listing. An admin reviews the request and the affected account receives the relevant notification.

## Evidence and unresolved decisions

Local source inspection confirms public view declarations in src/App.tsx, publisher view declarations in src/Dashboard.tsx, and review workflows in src/Admin.tsx. Styles are in src/index.css, src/dashboard.css and src/admin.css. Source inspection does not establish successful runtime behavior or complete mobile coverage. The original reference is [Figma Make](https://www.figma.com/make/U7J8VFln8KC3AHhwXYHeh4/).

The latest brief supersedes the earlier inquiry-composer plan with phone/WhatsApp contact. Backend gaps are recorded separately in ERD_TO_UI_MAPPING.md. Confirm renewal start rules, edit review visibility, agency ownership and assignment, report policy, verification evidence, notification event delivery, and advanced filters beyond ERD-backed attributes.

## Documentation index

- [Design system](DESIGN_SYSTEM.md)
- [Page inventory](PAGE_INVENTORY.md)
- [Components and interactions](COMPONENTS_PLAN.md)
- [ERD mapping and backend gaps](ERD_TO_UI_MAPPING.md)
- [Implementation roadmap](IMPLEMENTATION_ROADMAP.md)
