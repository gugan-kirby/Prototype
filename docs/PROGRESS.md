# Implementation Progress

"Differs" is the share of pixels that visibly differ from the reference. Most of it
comes from blur around text in the references, which sharp text cannot reproduce.

| Screen | Name | UI | Functionality | Testing | Differs |
|---|---|---|---|---|---|
| 01 | Splash | Done | Done | Done | 4.9% |
| 02 | Welcome / Login | Done | Done | Done | 2.7% |
| 03 | Registration | Pending | Pending | Pending | |
| 04 | Customer Home | Pending | Pending | Pending | |
| 05 | New Enquiry – Details | Pending | Pending | Pending | |
| 06 | New Enquiry – Requirements | Pending | Pending | Pending | |
| 07 | Review Enquiry | Pending | Pending | Pending | |
| 08 | Enquiries | Pending | Pending | Pending | |
| 09 | Quotes Received | Pending | Pending | Pending | |
| 10 | Quote Details | Pending | Pending | Pending | |
| 11 | My Orders | Pending | Pending | Pending | |
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
