# وسيط — Page inventory

Paths below are proposed destinations for the future HTML frontend. Related list/detail/form states can share a page. They are not newly created application files. Source evidence refers to inspected view declarations or components, and runtime verification remains pending.

## Public and account entry

| Screen | Suggested destination | Actors and required behavior | Source evidence |
|---|---|---|---|
| الرئيسية | index.html | All visitors. Search, category/area discovery, standard listing cards and advertiser entry | App home |
| العقارات | pages/properties.html | All visitors. Search, advanced filters, sorting, count, pagination and reset | App listings and FilterSidebar |
| تفاصيل العقار | pages/property.html | All visitors. Photos, specifications, area, publisher, phone/WhatsApp, favorite and report entry | App details |
| ملف المعلن | pages/advertiser.html | All visitors. Owner/broker/agency presentation and eligible public inventory | App advertiser |
| الدخول / إنشاء حساب | pages/auth.html | Account access and role-appropriate registration UI. Admin access is controlled separately | App auth. Final role admission rules pending |
| المفضلة | pages/favorites.html | Signed-in seeker and any other role granted saving. Persist within approved demo scope | App favorites |
| الإبلاغ عن إعلان | Detail dialog or pages/report.html | Reporter describes a listing issue and sees receipt feedback | App report entry and Admin reports. Submission contract is a gap |

## Publisher and member account

| Screen | Suggested destination | Actors and required behavior | Source evidence |
|---|---|---|---|
| لوحة الحساب | pages/account/index.html | Owner, Broker, Agency, Agent. Scoped overview and actionable counts | Dashboard overview |
| عقاراتي / عقارات المكتب / العقارات المسندة لي | pages/account/properties.html | Role-scoped inventory, search, status filter, view/edit and renewal entry | Dashboard properties |
| إضافة / تعديل عقار | pages/account/property-form.html | Permitted publisher. Shared form, image preview, validation, submit for admin review | Dashboard add/edit |
| تفاصيل إعلان بالحساب | pages/account/property.html | Authorized publisher. Full private review state and available actions | Dashboard property |
| تجديد الإعلان | Listing dialog | Explicit manual 30-day renewal request, confirmation and outcome | Dashboard renewal modal |
| إدارة الموظفين | pages/account/employees.html | Agency. Employee list, add/edit access, activation and permitted assignments | Dashboard employees |
| التوثيق | pages/account/verification.html | Owner, Broker, Agency in current reference. Confirm eligibility for other roles | Dashboard verification |
| الإشعارات | pages/account/notifications.html | All signed-in roles. Relevant in-app events, read state and target navigation | Dashboard notifications. Seeker access needs reconciliation |
| الملف الشخصي / ملف المكتب | pages/account/profile.html | Own identity or agency profile, edit permitted contact information | Dashboard profile |
| إعدادات الحساب | pages/account/settings.html | Own account preferences and email notification settings | Dashboard settings |

## Administration

| Screen | Suggested destination | Required behavior | Source evidence |
|---|---|---|---|
| لوحة الإدارة | pages/admin/index.html | Admin overview of queues and actions | Admin home |
| مراجعة الإعلانات | pages/admin/listings.html | Search/filter pending listings and open a review | Admin listings |
| مراجعة إعلان | pages/admin/listing.html | Inspect listing and advertiser, approve/reject with feedback | Admin listing |
| مراجعة التعديلات | pages/admin/edits.html | Queue of requested changes | Admin edits |
| تفاصيل التعديل | pages/admin/edit.html | Inspect current/proposed changes and decide | Admin edit |
| المستخدمون / تفاصيل المستخدم | pages/admin/users.html and user.html | Inspect role, activity and verification, exercise approved moderation | Admin users/user |
| المكاتب / تفاصيل المكتب | pages/admin/agencies.html and agency.html | Inspect agency information and related people/listings | Admin agencies/agency |
| طلبات التوثيق / مراجعة الطلب | pages/admin/verification.html and verification-request.html | Inspect permitted evidence and approve/reject | Admin verification/verify |
| البلاغات / تفاصيل البلاغ | pages/admin/reports.html and report.html | Inspect reported listing, resolve/close, apply approved action | Admin reports/report |
| إشعارات الإدارة | pages/admin/notifications.html | Admin account events and navigation | Admin notifications |

## Requirements mapped to destinations

| Requirement | Primary destinations |
|---|---|
| Arabic RTL, Sadat City, Desert Modern | Every screen and shared shell |
| Search and advanced filters | Home and properties |
| WhatsApp and phone only | Property details and advertiser |
| Admin publication approval | Property form, account listings, admin listing review |
| Manual 30-day renewal | Account listings, account property, renewal dialog, notifications |
| Agency employee management | Employees, assigned inventory, agency profile, admin agency detail |
| Verification and reports | Verification request/review, report submission/review |
| In-app and email notifications | Account/admin notifications and settings |

## Shared states and missing decisions

Every list requires empty, filtered-empty and error/retry presentation. Every detail needs invalid or unavailable ID handling. Forms need validation, processing and outcome states. An expired or unapproved public listing must not provide an active advertising path.

Confirm which contact details are public, whether reporting requires sign-in, seeker account layout, account recovery design, permitted employee operations, verification evidence, and renewal review routing. Backend gaps are tracked in ERD_TO_UI_MAPPING.md. MVP omits featured listings, property comparison and the earlier in-app inquiry composition/inbox journey.
