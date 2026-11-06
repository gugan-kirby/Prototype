# Progress

Actual status only. Scope and order are in `PROJECT_PLAN.md`.

**Statuses:** `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `IN REVIEW`, `COMPLETED`.

`COMPLETED` means merged into `main`. It does not mean tested, so read the Validation column.

## Latest checkpoint

**Updated:** 2026-11-07

- **Branch:** `main`, with a clean working tree and no feature branches open.
- **Last feature merged:** A-04 Record views, branch `feature/record-views`.
- **In progress:** nothing.
- **Blocked:** nothing.
- **Next action:** start F-01 Refresh saved data on `fix/stale-saved-data`.

## Known issues

| Issue | Effect | Resolved by |
|---|---|---|
| Saved data can go stale | A browser that saved data before a seed change keeps the old copy, and can fail with "Unknown collection". Clearing site data fixes it. | F-01 |
| Automated tests out of date | Last full run was 75 passed, at T-08. They were not run for T-09 onwards, and may no longer pass. | Decision 1 in `PROJECT_PLAN.md` |
| Later behaviour unconfirmed | Interactions added from T-10 onwards have not been exercised, including chat, PDF download, Pay Now and vendor filter. Only their reference views were rendered. | F-02 |
| T-09 fix not rechecked | The final test run for T-09 found the Enquiry Details tab did not hide the quotes list. It was fixed in CSS, but the fix was not rerun. | F-02 |

## Tasks

"Differs" is the share of pixels that visibly differ from the reference, measured on 2026-11-06. Much of it comes from blur around text in the references. All rows were last updated on 2026-11-06.

### Completed

| ID | Task | Status | Priority | Branch | Commit | PR | Validation |
|---|---|---|---|---|---|---|---|
| T-00 | App foundation | COMPLETED | High | `feature/app-foundation` | `c1efbc6` | [#1](https://github.com/gugan-kirby/Prototype/pull/1) | Tests passed |
| T-01 | Splash | COMPLETED | High | `feature/splash` | `7a612aa` | [#2](https://github.com/gugan-kirby/Prototype/pull/2) | Tests passed. Differs 4.9% |
| T-02 | Welcome / Login | COMPLETED | High | `feature/welcome-login` | `6ba70c9` | [#3](https://github.com/gugan-kirby/Prototype/pull/3) | Tests passed. Differs 2.8% |
| T-03 | Registration | COMPLETED | High | `feature/registration` | `b36c6fa` | [#4](https://github.com/gugan-kirby/Prototype/pull/4) | Tests passed. Differs 2.6% |
| T-04 | Customer Home | COMPLETED | High | `feature/customer-home` | `e57e077` | [#5](https://github.com/gugan-kirby/Prototype/pull/5) | Tests passed. Differs 5.6% |
| T-05 | New Enquiry: Details | COMPLETED | High | `feature/enquiry-details` | `7a96183` | [#6](https://github.com/gugan-kirby/Prototype/pull/6) | Tests passed. Differs 3.3% |
| T-06 | New Enquiry: Requirements | COMPLETED | High | `feature/enquiry-requirements` | `f890cf3` | [#7](https://github.com/gugan-kirby/Prototype/pull/7) | Tests passed. Differs 4.0% |
| T-07 | Review Enquiry | COMPLETED | High | `feature/enquiry-review` | `15f8a23` | [#8](https://github.com/gugan-kirby/Prototype/pull/8) | Tests passed. Differs 4.4% |
| T-08 | My Enquiries | COMPLETED | High | `feature/my-enquiries` | `c28319f` | [#9](https://github.com/gugan-kirby/Prototype/pull/9) | Tests passed. Differs 4.6% |
| T-09 | Quotes Received | COMPLETED | High | `feature/quotes-received` | `ba75983` | [#10](https://github.com/gugan-kirby/Prototype/pull/10) | Partly tested, see below. Differs 7.3% |
| T-10 | Quote Details | COMPLETED | High | `feature/quote-details` | `20e5e0f` | [#11](https://github.com/gugan-kirby/Prototype/pull/11) | Not tested. Differs 7.2% |
| T-11 | My Orders | COMPLETED | High | `feature/my-orders` | `07d3344` | [#12](https://github.com/gugan-kirby/Prototype/pull/12) | Not tested. Differs 6.2% |
| T-12 | Order Tracking | COMPLETED | High | `feature/order-tracking` | `d025398` | [#13](https://github.com/gugan-kirby/Prototype/pull/13) | Not tested. Differs 7.0% |
| D-01 | Project documentation | COMPLETED | High | `docs/project-continuity` | Merged by PR #14 | [#14](https://github.com/gugan-kirby/Prototype/pull/14) | Checked against the repository and Git history |
| T-13 | Invoices | COMPLETED | High | `feature/invoices` | `c8b650b` | [#15](https://github.com/gugan-kirby/Prototype/pull/15) | Not tested. Differs 6.3% |
| T-14 | Payments | COMPLETED | High | `feature/payments` | `21f45df` | [#16](https://github.com/gugan-kirby/Prototype/pull/16) | Not tested. Differs 7.8% |
| T-15 | Vendor Dashboard | COMPLETED | High | `feature/vendor-dashboard` | `58ab4cc` | [#17](https://github.com/gugan-kirby/Prototype/pull/17) | Not tested. Differs 6.1% |
| T-16 | Profile | COMPLETED | High | `feature/profile` | `34c3985` | [#18](https://github.com/gugan-kirby/Prototype/pull/18) | Not tested. Differs 7.5% |
| V-01 | Vendor enquiries | COMPLETED | High | `feature/vendor-enquiries` | `a3ecf15` | [#19](https://github.com/gugan-kirby/Prototype/pull/19) | Not tested. Render reviewed by eye |
| V-02 | Submit quote | COMPLETED | High | `feature/submit-quote` | `e5196e5` | [#20](https://github.com/gugan-kirby/Prototype/pull/20) | Not tested. Render reviewed by eye |
| V-03 | Manage quotes | COMPLETED | Medium | `feature/manage-quotes` | `3be97ea` | [#21](https://github.com/gugan-kirby/Prototype/pull/21) | Not tested. Render reviewed by eye |
| V-04 | Vendor orders | COMPLETED | High | `feature/vendor-orders` | `3a0741d` | [#22](https://github.com/gugan-kirby/Prototype/pull/22) | Not tested. Render reviewed by eye |
| V-05 | Update production status | COMPLETED | High | `feature/production-status` | `2d4eaae` | [#23](https://github.com/gugan-kirby/Prototype/pull/23) | Not tested. Render reviewed by eye |
| V-06 | Vendor messages | COMPLETED | Medium | `feature/vendor-messages` | `c76621d` | [#24](https://github.com/gugan-kirby/Prototype/pull/24) | Not tested. Render reviewed by eye |
| A-01 | Admin shell and login | COMPLETED | Medium | `feature/admin-shell` | `4feb74f` | [#25](https://github.com/gugan-kirby/Prototype/pull/25) | Not tested. Render reviewed by eye |
| A-02 | Vendor verification | COMPLETED | Medium | `feature/vendor-verification` | `d44a51f` | [#26](https://github.com/gugan-kirby/Prototype/pull/26) | Not tested. Render reviewed by eye |
| A-03 | User management | COMPLETED | Medium | `feature/user-management` | `2c6a16e` | [#27](https://github.com/gugan-kirby/Prototype/pull/27) | Not tested. Render reviewed by eye |
| A-04 | Record views | COMPLETED | Medium | `feature/record-views` | Merged by this task's PR | See Git history | Not tested. Render reviewed by eye |

### Not started

| ID | Task | Status | Priority |
|---|---|---|---|
| F-01 | Refresh saved data when the seed changes | NOT STARTED | High |
| F-02 | Walk through both workflows end to end | NOT STARTED | Medium |

## Implementation details

### T-00 App foundation

App shell, `localStorage` store, hash router, escaping HTML helper, request wrapper, tokens, bundled Figtree font, and test tools.

### T-01 Splash

Vector logo, background recovered from the reference, Get Started and Login / Register links.

### T-02 Welcome / Login

Welcome page, login by email or mobile, role-based redirect, guest session, password reset sheet and demo account shortcuts. Adds shared icons, buttons, fields, toasts and sheets. Login has no reference, so it follows the Register design.

### T-03 Registration

Customer and vendor accounts, field validation and duplicate checks. New vendors start unverified.

### T-04 Customer Home

Banner, quick actions, categories, tab bar, side menu and notifications. Guests get a login prompt, and failed loads offer a retry. "CNC Maching Machining" in the reference is corrected to "CNC Machining".

### T-05 New Enquiry: Details

Validation, sub categories that follow the category, category preselected from Home, and a draft kept between steps.

### T-06 New Enquiry: Requirements

Real uploads stored in IndexedDB, with type and size limits, replace and remove. A drawing or specifications text is required, so jobs without a drawing can still be raised.

### T-07 Review Enquiry

Submit creates the enquiry and notifies verified vendors. A failed submit keeps the draft. Tolerance is added to the specifications line so it can be checked before submitting.

### T-08 My Enquiries

Reusable list layout with search, status tabs, category filter and sort. Shows 4 cards as in the reference, and loads more on scroll. Tabs follow the image, not the brief.

### T-09 Quotes Received

Quotes sorted cheapest first, Enquiry Details tab, and the RFQ / Quotes list. Accepting asks for confirmation, then creates the order and invoice, closes the enquiry, declines other quotes and notifies vendors.

**Validation:** in the final test run, 8 of 11 tests passed, including accepting a quote and blocked access. Of the 3 failures, 1 was the tab bug listed under known issues, and 2 were a test helper reading saved data before any existed. Testing then stopped at the user's request.

### T-10 Quote Details

Vendor panel, call and chat, PDF download, attachment download and accept. Unit Price, GST, Total, Payment Terms, Validity and Notes sit below the reference height. Adds the message thread.

### T-11 My Orders

Search, status tabs, vendor filter, sort and progress bars.

### T-12 Order Tracking

The tracker keeps the reference's four steps. The brief's six stages are stored on each order, drive the tracker and appear on Order Details.

### D-01 Project documentation

Adds `PROJECT_PLAN.md`, moves progress tracking to `PROGRESS.md`, and expands `CLAUDE.md`. Brings in the workflow rules from the unmerged `docs/git-workflow-rules` branch.

### T-13 Invoices

Six sample invoices with search and status tabs. Shows 4 cards as in the reference. Pay Now opens a simulated payment sheet that marks the invoice paid and records the payment. Overdue is worked out from the due date. Invoice Details has a PDF download.

### T-14 Payments

Summary panel, status tabs and invoice cards with Pay Now. Total Paid counts the current month, which matches the reference exactly. Wallet Balance, Add Money and Recent Transactions come from the brief, so they sit below the reference height. Invoices can be paid from the wallet when the balance covers them. No refund records exist yet, so the Refunds tab is empty.

### T-15 Vendor Dashboard

Banner, four stat cards, enquiry requests, orders overview and revenue chart, with a vendor tab bar and menu. All figures are calculated from seed data, using a second sample customer. New vendors see an awaiting-verification notice. The reference's "Active Orders" is shown as "Orders Received", because 4 of the 12 are completed. Links to `/v/enquiries`, `/v/quotes` and `/v/orders` wait for V-01 to V-04.

### T-16 Profile

Profile card, photo upload, six menu rows, Log Out and app version. Each row opens a working page: Company Details, Account Settings, Payment Methods, Notifications, Privacy & Security and Help & Support. The brief's My Addresses, My Documents, About Us and Terms & Conditions sit below the reference height. Saved addresses feed the delivery dropdown. Vendors share this page, with their own tag and tab bar.

The reference shows an unread dot on the bell, but other customer references do not, so the sample customer starts with none. The dot appears whenever there are unread notifications.

### V-01 Vendor enquiries

Lists open enquiries and those already quoted, with search and tabs. The detail page shows requirements, specifications and drawing download. Unverified vendors see a notice instead of the quote button.

### V-02 Submit quote

Quote form with validation. Only verified vendors can quote, and each vendor can quote once per enquiry. Submitting moves the enquiry to Quoted and notifies the customer. GST is fixed at 18%.

### V-03 Manage quotes

Lists the vendor's quotes with search and status tabs. Each card opens the enquiry.

### V-04 Vendor orders

Lists orders received with search, status tabs and progress. The detail page shows the order summary and all six production stages.

### V-05 Update production status

The vendor moves an order through the six stages, one at a time, with a confirmation. Each step notifies the customer and updates their tracker. Reaching Delivered completes the order.

### V-06 Vendor messages

Vendors see their customer threads under Messages in the side menu, and can reply. Replies notify the customer. Order Details links to the thread.

### A-01 Admin shell and login

Desktop console in `admin.html` with a sidebar, role check and overview figures. Admin and staff log in from the normal login page. It reuses the router, store and tokens.

### A-02 Vendor verification

Lists vendors with their verification status. Admins can verify a vendor or remove verification, and the vendor is notified. Staff see the list without actions.

### A-03 User management

Lists all users without their passwords. Admins can suspend or reactivate accounts, but not their own. Suspended users cannot log in. Staff see the list without actions.

### A-04 Record views

Read-only tables for enquiries, orders, invoices and payments, with search.

## Change history

| Date | Change | Reason |
|---|---|---|
| 2026-11-06 | Direct marketplace chosen over the JobWork middleman model | User decision |
| 2026-11-06 | Browser-only data chosen over a Node server | User decision |
| 2026-11-06 | Reference images made the primary source of truth | User decision |
| 2026-11-06 | Full branch, PR, merge and cleanup workflow automated | User decision |
| 2026-11-06 | Word "screen" removed from unpushed commits and branches | User decision |
| 2026-11-06 | Rebase merges used instead of squash | Squash changes the author name, from PR #2 onwards |
| 2026-11-06 | Total Paid scoped to the current month | Matches the reference's figure and count, which replaced a pending decision |
| 2026-11-06 | Automated test writing and running stopped, from T-09 onwards | User decision |
