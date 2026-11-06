# Implementation Progress

"Differs" is the share of pixels that visibly differ from the reference. Most of it
comes from blur around text in the references, which sharp text cannot reproduce.

| Screen | Name | UI | Functionality | Testing | Differs |
|---|---|---|---|---|---|
| 01 | Splash | Done | Done | Done | 4.9% |
| 02 | Welcome / Login | Done | Done | Done | 2.7% |
| 03 | Registration | Done | Done | Done | 2.6% |
| 04 | Customer Home | Done | Done | Done | 5.4% |
| 05 | New Enquiry – Details | Done | Done | Done | 3.4% |
| 06 | New Enquiry – Requirements | Done | Done | Done | 4.0% |
| 07 | Review Enquiry | Done | Done | Done | 4.5% |
| 08 | Enquiries | Done | Done | Done | 4.6% |
| 09 | Quotes Received | Done | Done | Not run | 7.3% |
| 10 | Quote Details | Done | Done | Not run | 7.2% |
| 11 | My Orders | Done | Done | Not run | 6.2% |
| 12 | Order Tracking | Pending | Pending | Pending | |
| 13 | Invoices | Pending | Pending | Pending | |
| 14 | Payments | Pending | Pending | Pending | |
| 15 | Vendor Dashboard | Pending | Pending | Pending | |
| 16 | Profile | Pending | Pending | Pending | |

## Screen reports

### 01 Splash

- **Components:** status band, recovered background texture, vector logo, wordmark,
  tagline, Get Started button, Login / Register link.
- **Interactions:** Get Started opens Welcome. Login / Register opens Login.
- **Tests:** content, both links, and layout from 320 to 430 px wide.
- **Remaining:** none.

### 02 Welcome / Login

- **Components:** heading, wordmark, illustration, Login and Register buttons, guest
  link, three trust badges. Login form with password toggle and reset sheet.
- **Interactions:** login by email or mobile, role-based redirect, guest session,
  validation, failed-request handling, demo account shortcuts.
- **Tests:** content, links, guest, validation, wrong password, retry after failure,
  password reset, and escaping of input.
- **Remaining:** Login has no reference image, so it follows the Register design.

### 03 Registration

- **Components:** Customer / Vendor switch, five icon fields, terms checkbox and sheet,
  Register button, Login link.
- **Interactions:** field validation, duplicate email and mobile checks, account
  creation, and role-based redirect. New vendors start unverified.
- **Tests:** required fields, invalid values, duplicates, both roles, logging in again.
- **Remaining:** none.

### 04 Customer Home

- **Components:** app header, bell, banner, six quick actions, four categories, tab bar
  with floating button, side menu, notifications list.
- **Interactions:** every action, tab and category navigates. Guests get a login prompt.
  Signed-out visitors go to Welcome. Failed loads offer a retry.
- **Tests:** content, all navigation, menu, guest prompt, session guard, retry.
- **Changes from reference:** "CNC Maching Machining" is corrected to "CNC Machining".

### 05 New Enquiry – Details

- **Components:** three-step progress bar, name field, four dropdowns, quantity with
  unit, Next button.
- **Interactions:** required-field and quantity validation, sub categories that follow
  the category, category preselected from Home, draft saved between steps.
- **Tests:** labels, validation, dependent dropdown, draft restore, guards, escaping.
- **Remaining:** none.

### 06 New Enquiry – Requirements

- **Components:** upload box, specifications field, surface finish and tolerance
  dropdowns, Back and Next buttons.
- **Interactions:** real file upload stored in IndexedDB, type and size limits, replace
  and remove, draft kept between steps. A drawing or specifications text is required.
- **Tests:** all file types, rejected files, a 10MB file read back from storage,
  replace, remove, validation and draft handling.
- **Remaining:** none.

### 07 Review Enquiry

- **Components:** progress bar on step 3, details summary, file row, specifications,
  Back and Submit Enquiry buttons, confirmation sheet.
- **Interactions:** submit creates the enquiry and notifies verified vendors. The
  drawing can be downloaded. A failed submit keeps the draft for retry.
- **Tests:** summary, draft guard, submit, vendor notification, double tap, retry,
  download, escaping.
- **Changes from reference:** tolerance is added to the specifications line so it can
  be checked before submitting. The comparison leaves it out to match the image.

### 08 Enquiries

- **Components:** app header, title, search, filter button, status tabs, enquiry cards,
  status badges, tab bar. The list layout is reusable.
- **Interactions:** search, status tabs, category filter, sort, and cards that open the
  enquiry. Shows 4 cards first, as in the reference, and loads more on scroll.
- **Tests:** reference content, paging, tabs, search across all pages, filter, sort,
  empty results, new enquiry at the top.
- **Changes from reference:** tabs follow the image, not the brief's Pending and Ordered.

### 09 Quotes Received

- **Components:** enquiry summary, quote count, Quotes and Enquiry Details tabs, vendor
  quote cards, confirmation sheet, RFQ / Quotes list.
- **Interactions:** quotes sorted cheapest first. Accepting creates the order and
  invoice, closes the enquiry, declines other quotes and notifies vendors.
- **Tests:** not run. Automated testing stopped from this feature onwards, as requested.

### 10 Quote Details

- **Components:** vendor panel, summary panel, enquiry table, specifications,
  attachment, Quote Terms section below the reference height, and message thread.
- **Interactions:** call the vendor, chat with the vendor, download the quote as a PDF,
  download the attachment, accept the quote.
- **Tests:** not run, as requested.
- **Changes from reference:** Unit Price, GST, Total, Payment Terms, Validity and Notes
  come from the brief, so they sit below the reference height.

### 11 My Orders

- **Components:** title, search, filter, status tabs, order cards with progress bars,
  taller tab bar as in the reference.
- **Interactions:** search by part, order number, vendor or category. Filter by vendor,
  sort, and open an order.
- **Tests:** not run, as requested.
