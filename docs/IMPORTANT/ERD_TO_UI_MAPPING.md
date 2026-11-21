# وسيط — ERD mapping and backend gaps

The supplied ERD image is the schema reference. The tables below reproduce its entities and fields. Figma source objects describe prototype presentation and do not establish additional schema. The latest brief defines required product capabilities.

## Existing entities and fields

| Entity | Fields visible in ERD | Relationship and frontend use |
|---|---|---|
| roles | id, name | One role to many users. Required product roles are Owner, Broker, Agency, Agent, Property Seeker and Admin. Stored IDs and names need agreement |
| users | id, role_id, full_name, phone, email, password_hash, avatar_url, created_at, is_active, is_verified | One role per user. Publisher identity, account data and moderation flags. password_hash is server-only and excluded from browser payloads/fixtures |
| broker_profiles | id, user_id, company_id, whatsapp, bio, is_approved | user_id is unique, allowing at most one profile per user. Many broker profiles can reference one company |
| companies | id, name, phone, address, logo_url, is_approved | Agency display information and associated broker profiles. Address describes the company |
| property_categories | id, name, sort_order | One category groups many types. Category display and ordering |
| property_types | id, category_id, name, image_url | One type classifies many properties. Type label, image and selector |
| areas | id, name, description, latitude, longitude, is_active | One area relates to many properties. Area choices and approximate area map context |
| properties | id, user_id, property_type_id, area_id, title, description, price, listing_type, status, rent_period, size_m2, bedrooms, bathrooms, floor, finishing_type, is_featured, views_count, created_at, updated_at | Each property belongs to a publishing user, type and area. Supports summaries, specifications, supported filters and status presentation |
| property_images | id, property_id, url, is_main, sort_order | Many images per property. Main card photo and ordered gallery |
| favorites | user_id, property_id, created_at | Composite primary key is user_id plus property_id. Resolves saved properties and prevents duplicate pairs |
| inquiries | id, sender_id, receiver_id, property_id, message, status, created_at | Each inquiry references a property and sender/receiver users. Legacy entity outside the phone/WhatsApp-only MVP contact flow |

The diagram draws a one-to-one user/profile relationship and explicitly marks user_id unique. It does not settle profile optionality for every role. Most column nullability and enum values are unspecified.

## Supported joins and presentation

| UI need | Existing data path | Limit |
|---|---|---|
| Property category and type | properties.property_type_id → property_types.id → property_categories.id through category_id | No category_id is added to properties |
| Property area | properties.area_id → areas.id | Coordinates represent the area, with no exact property location supplied |
| Publisher | properties.user_id → users.id | Does not independently establish agency ownership or agent assignment |
| Broker affiliation | users.id → broker_profiles.user_id → companies.id through company_id | Company login and management permissions are unspecified |
| Listing photos | property_images.property_id → properties.id | Confirm cover uniqueness. Proposed fallback is first ordered image then an approved placeholder |
| Favorites | favorites filtered by user_id, joined by property_id | Apply public eligibility when a saved listing expires or is moderated |
| Verification display | users.is_verified, broker_profiles.is_approved, companies.is_approved | Agree distinct meanings before assigning badges |
| Search/filter | title, description, listing_type, price, size_m2, bedrooms, bathrooms, floor, finishing_type, rent_period and lookups | Required values and type-specific applicability need confirmation |
| Featured state | properties.is_featured | Retained in schema reference and excluded from MVP behavior |
| View count | properties.views_count | Display is possible. Counting and analytics rules remain server concerns |

## Backend gaps requiring contracts

This section identifies missing capabilities without proposing tables or field names.

| ID | Required capability | Current limit | Decision needed and affected UI |
|---|---|---|---|
| G01 | Role permissions and agency identity | Single user role and broker-company link provide incomplete agency ownership and employee permissions | Define agency account ownership, membership, registration and role capabilities. Affects account access, employees and all private lists |
| G02 | Employee assignments | No explicit property-to-assigned-employee relationship or permission history | Define assignment, reassignment, deactivation/removal effects and scope of agent editing/renewal. Affects employee management and assigned inventory |
| G03 | Publication review | properties.status supports a current label, but review history, reviewer and outcome explanations are unspecified | Define review transitions, recorded decisions, reasons and public eligibility. Affects submit/review/detail screens |
| G04 | Proposed edit review | Only one property representation and updated_at are shown | Define how approved content and proposed changes coexist and what remains public. Affects edit queue and public detail |
| G05 | Manual 30-day renewal | No authoritative publication, expiration or renewal history is depicted | Define clock, time zone, start point, early renewal, request decision, duplicate handling and expiry processing. Do not calculate renewal from created_at or updated_at alone |
| G06 | Verification requests and evidence | Verification/approval flags provide only partial outcome state | Define request lifecycle, required evidence per role, private storage, review reasons and resubmission. Affects verification form and admin review |
| G07 | Reports | No report submission or resolution representation | Define reporter eligibility, issue choices, target, moderation actions, resolution and abuse handling. Affects report dialog and admin queue |
| G08 | In-app and email notifications | Email contact exists on users, but event, unread, preference and delivery state are absent | Define recipients, events, channel preferences, delivery/retry outcomes and navigation targets. Affects lists, badges and settings |
| G09 | WhatsApp across advertiser roles | Only broker_profiles.whatsapp is explicit | Confirm approved WhatsApp sourcing for owners, agencies and agents and who appears as the listing contact. Affects public contact panels |
| G10 | Additional prototype attributes | Source includes amenities, availability and publisher display details beyond direct ERD support | Confirm scope and data contracts before exposing unsupported filters/forms. Area coordinates cannot supply precise property pins |
| G11 | Account access and recovery | Stored user credential hash does not describe authentication/session/recovery workflows | Define server integration and error contracts. Frontend previews use fictional identity and safe demonstrations |
| G12 | Upload and public visibility rules | Images have URLs and ordering, but upload limits and service behavior are unspecified | Define image validation, evidence handling, missing assets and inactive/unapproved related-record behavior |

## Decisions that remain open

Confirm actual lookup values, required fields, numeric bounds, enum serialization, property-type applicability and how Egypt currency/rent periods are represented. Confirm whether expired listings have a public informational page or become unavailable, whether pending edits affect the active listing, and which notification events are mandatory.

No new schema entities or columns are specified in these documents. Backend owners can resolve G01–G12 with their preferred design. The frontend plan can demonstrate pending workflows as fictional UI scenarios until contracts are agreed.
