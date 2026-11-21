# وسيط — Design system

## Identity

Use Arabic throughout navigation, content, controls, validation, status messages and accessibility labels. The document language is Arabic and layout direction is RTL. The geographic identity is مدينة السادات، المنوفية، مصر. Cairo and Desert Modern styling are approved.

| Brand token | Approved value | Usage |
|---|---|---|
| Primary green | #6F8B4E | Brand emphasis and primary actions |
| Dark green | #526B38 | Strong emphasis and action states |
| Background | #FCFAF7 | Warm page canvas |
| Sand beige | #F5E6D3 | Large secondary surfaces |
| Secondary sand | #EAD7BE | Surface separation and accents |
| Terracotta | #C97B63 | Accent details |
| Text | #2F2F2F | Main text |
| White | #FFFFFF | Cards and contrasting surfaces |

src/index.css currently declares dark green as #536D37. Record this discrepancy for visual reconciliation against the approved #526B38 before implementation. The original source is preserved.

## Observed source details

The global stylesheet imports Cairo weights 400, 500, 600, 700 and 800. Its base radius is 16px, smaller radius 12px, and button radius 11px. It declares soft shadows of 0 6px 24px with rgba(54,46,35,.07) and 0 18px 50px with rgba(54,46,35,.12). The public container has a 1200px maximum with 48px total side allowance, desktop header height 82px, and standard button height 44px.

The source includes a warm split hero, photography, category cards, listing cards, filter sidebar, image gallery, advertiser panel, dashboard tables and admin review panels. These are reference observations. Confirm rendered geometry at implementation time.

Public stylesheet breakpoints are 900px and 620px. Dashboard breakpoints are 1050px, 800px and 600px. Admin breakpoints are 1050px, 780px and 480px. Preserve intended responsive layouts when translating to plain CSS. Mobile controls must retain access to all required filters and review actions.

## Component states and meaning

- Buttons need default, hover, focus, pressed, disabled and processing states where relevant.
- Form fields need labels, help, valid and invalid states. Place field errors near the input with an accessible association.
- Listing lifecycle labels observed in source include «قيد المراجعة», «منشور», «مرفوض» and «منتهي». These are UI vocabulary pending confirmation of stored enum values.
- Verification, account activity, publication approval and availability each require a clear label. A verified account still requires listing approval.
- Status labels combine text and visual styling. Color alone is insufficient to communicate a decision.
- Empty lists need a relevant next action. Examples include «لا توجد نتائج مطابقة» with filter reset and «لم تحفظ أي عقار بعد» with a browse link.
- Administrative rejection and resolution dialogs must clearly name the affected item and show the resulting state.

## Arabic and accessibility

Use logical CSS directions and preserve DOM reading order as layouts collapse. Isolate phone numbers, email addresses and URLs so their punctuation reads correctly. Use locale-aware formatting for amounts and dates and include «ج.م.» and «م²» where appropriate. Confirm preferred Arabic or Western digits before finalizing copy.

Provide keyboard access, visible focus, appropriate landmark headings and descriptive Arabic image alternatives. Overlays trap focus while open, close with Escape where appropriate, and restore focus to their trigger. Announce result counts and form feedback without moving focus unnecessarily. Check text contrast using actual color combinations, including white text on primary green.

## Assets and content

Reuse approved logo construction, icons and image placement from the source after visual inspection. Verify image rights and availability before final delivery. All listing names, people, businesses and transactions used in demonstrations are fictional. Any simulated phone/WhatsApp control should avoid contacting an uninvolved real person.

## Design reconciliation checklist

Confirm full mobile screens, lengthy Arabic labels, broken images, loading/error states, expired listing detail, renewal confirmation, report submission and completion, seeker account navigation, employee permissions and notification preferences. Existing source includes amenities and other presentation details with no matching ERD fields. Record these as gaps before committing to data-backed controls. Featured listing emphasis and property comparison have no MVP component.
