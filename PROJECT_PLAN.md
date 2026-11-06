# Project Plan

This file holds scope and task order. Actual status lives in `PROGRESS.md`, and rules live in `CLAUDE.md`.

## Overview

JobWork is a marketplace for custom manufacturing work, starting in Chennai. Customers raise enquiries with drawings and specifications, vendors quote, and customers accept a quote, track the order and pay.

The objective is a working prototype that matches the 16 reference images in `Image /` as closely as technically possible, and whose visible controls all work.

## Scope

| Portal | Users | Form | Basis |
|---|---|---|---|
| Customer | Buyers | Mobile | 15 reference images |
| Vendor | Suppliers | Mobile | 1 reference image, plus the brief's vendor workflow |
| Admin / Staff | JobWork team | Desktop | No reference images |

**In scope:** the customer and vendor workflows below, authentication, roles, profile, notifications, document uploads, search and filters, order history, payment records and vendor messaging.

**Out of scope:** a server, real payments, real email or SMS, and data shared across devices.

### Customer workflow

Splash → Welcome → Registration → Home → New Enquiry → Requirements → Review → Submit → Enquiries → Quotes → Accept Quote → My Orders → Order Tracking → Invoice → Payment.

### Vendor workflow

Registration → Vendor Dashboard → View Enquiries → Review Requirements → Submit Quote → Manage Quotes → Receive Orders → Update Production Status → Dispatch → Complete Orders.

## Technical requirements

- Plain HTML, CSS and JavaScript with no dependencies.
- `data/db.json` seeds `localStorage`, which all tabs of a browser share.
- Must be served over HTTP: `python3 -m http.server 8000`.
- Pages render at 426×923 CSS px at 2x for comparison, and stay usable from 320 px wide.

## Reference map

| ID | Page | Reference image | Route |
|---|---|---|---|
| T-01 | Splash | `JobWork_Screen_01_Splash.png` | `/` |
| T-02 | Welcome / Login | `JobWork Industrial Welcome Screen.png` | `/welcome` |
| T-03 | Registration | `Mobile Register Screen UI.png` | `/register` |
| T-04 | Customer Home | `JobWork Precision Dashboard.png` | `/home` |
| T-05 | New Enquiry: Details | `JobWork New Enquiry Form.png` | `/enquiry/new` |
| T-06 | New Enquiry: Requirements | `New Enquiry Requirements Form.png` | `/enquiry/new/requirements` |
| T-07 | Review Enquiry | `Mobile Review Enquiry Form UI.png` | `/enquiry/new/review` |
| T-08 | My Enquiries | `JobWork Enquiry Dashboard.png` | `/enquiries` |
| T-09 | Quotes Received | `JobWork Quotes Received Screen.png` | `/enquiries/ENQ-1012` |
| T-10 | Quote Details | `Precision Metals Quote Details.png` | `/quotes/Q-1` |
| T-11 | My Orders | `JobWork My Orders Dashboard.png` | `/orders` |
| T-12 | Order Tracking | `Order Tracking Dashboard UI.png` | `/orders/ORD-1008` |
| T-13 | Invoices | `JobWork Invoice Management Dashboard.png` | `/invoices` |
| T-14 | Payments | `JobWork Payments Dashboard.png` | `/payments` |
| T-15 | Vendor Dashboard | `Modern JobWork Vendor Dashboard.png` | `/v/home` |
| T-16 | Profile | `JobWork Profile Settings Screen.png` | `/profile` |

## Remaining tasks, in order

Complete each task before starting the next. Status is tracked in `PROGRESS.md`.

### Milestone 2: finish the reference images

| ID | Task | Depends on | Priority | Includes |
|---|---|---|---|---|
| T-13 | Invoices | T-11 | High | Seed six invoices. List with search and tabs, due notes, Pay Now, invoice details and PDF download. Tab bar's last slot reads Invoices. |
| T-14 | Payments | T-13 | High | Summary panel, tabs, Pay Now flow that marks invoices paid. Tab bar's last slot reads Payments. Wallet, Add Money and recent transactions sit below the reference height. |
| T-15 | Vendor Dashboard | T-03 | High | Welcome banner, four stat cards, enquiry requests, orders overview, revenue chart, vendor tab bar. Verification state. Enough seed data for the figures. |
| T-16 | Profile | T-04 | High | Profile card, six menu rows, Log Out, app version. Linked pages for each row. Brief-only rows (My Addresses, My Documents, About Us, Terms & Conditions) sit below the reference height. |

### Milestone 3: vendor portal

No reference images exist, so these reuse the established design.

| ID | Task | Depends on | Priority | Includes |
|---|---|---|---|---|
| V-01 | Vendor enquiries | T-15 | High | List open enquiries and review requirements and drawings. |
| V-02 | Submit quote | V-01 | High | Quote form. Only verified vendors can quote. The enquiry moves to Quoted. |
| V-03 | Manage quotes | V-02 | Medium | List quotes with their status. |
| V-04 | Vendor orders | V-02 | High | List orders received. |
| V-05 | Update production status | V-04 | High | Move an order through the six stages to Dispatched and Delivered. Notify the customer. |
| V-06 | Vendor messages | V-04 | Medium | Reply to customer threads at `/v/chat/:id`. |

### Milestone 4: admin and staff portal

No reference images exist, so this reuses the design tokens in a desktop layout.

| ID | Task | Depends on | Priority | Includes |
|---|---|---|---|---|
| A-01 | Admin shell and login | T-02 | Medium | `admin.html`, session guard, and layout for admin and staff. |
| A-02 | Vendor verification | A-01 | Medium | Approve or suspend vendors. |
| A-03 | User management | A-01 | Medium | List and suspend users. |
| A-04 | Record views | A-01 | Medium | Read-only enquiries, orders, invoices and payments. |

### Milestone 5: wrap-up

| ID | Task | Depends on | Priority | Includes |
|---|---|---|---|---|
| F-01 | Refresh saved data when the seed changes | None | High | See the known issue in `PROGRESS.md`. |
| F-02 | Walk through both workflows end to end | V-05, T-14 | Medium | Confirm the customer and vendor journeys join up. |

F-01 can be done at any point, because it does not depend on other tasks.

## Testing requirements

Automated testing stopped on 2026-11-06 at the user's request. Each task is validated by comparing it with its reference and reviewing the diff. Tasks without a reference are validated by diff review only.

## Sample data notes

The references disagree with each other in places. The seed resolves this as follows:

- Each finished order has its own earlier closed enquiry, so a live enquiry and a finished order for the same part can both exist.
- Payments shows Total Paid ₹17,600 with Paid (4). The two paid invoices in March total ₹17,600, so Total Paid counts the current month, and the other two paid invoices are from February.
- The app clock is fixed at 15 Mar 2025, so "Due in 3 Days (18 Mar 2025)" and "Due in 5 Days (20 Mar 2025)" are both correct.

## Pending decisions

| # | Question | Default until answered |
|---|---|---|
| 1 | Should automated testing resume, and when? | Stay stopped. |
| 2 | Vendor Dashboard shows 12 "Active Orders", but that includes 4 completed. Should the label change? | Use the brief's "Orders Received", which is accurate and matches the 12 in the chart. |
| 3 | Commit `1e5835d` on `main` says "screens", and `c1efbc6` has the author name "Gugan". Fixing either needs a force-push to public history. Should they be fixed? | Leave them as they are. |
| 4 | Does the ban on the word "screen" extend to code, such as the `js/screens/` folder? | No. It covers commit messages, branch names and PR text. |
| 5 | Local branch `docs/git-workflow-rules` is now fully covered by `CLAUDE.md`. Can it be deleted? | Keep it. |

## Milestones

| Milestone | Scope | Status |
|---|---|---|
| 0 | Foundation | Completed |
| 1 | Authentication, enquiries, quotes and orders (T-01 to T-12) | Completed |
| 2 | Finish the reference images (T-13 to T-16) | Upcoming, next |
| 2 | Vendor portal | Upcoming |
| 3 | Admin and staff portal | Upcoming |
| 4 | Wrap-up | Upcoming |
