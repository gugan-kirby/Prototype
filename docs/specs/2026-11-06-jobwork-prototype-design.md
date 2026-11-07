# JobWork Prototype Design

## Goal

A working HTML, CSS and JavaScript prototype of JobWork, a direct marketplace for
custom manufacturing work. Customers raise enquiries, vendors quote, and customers
accept a quote and pay. There are three portals: customer, vendor and admin/staff.

## Decisions

| Topic | Decision |
|---|---|
| Business model | Direct marketplace. Customers deal directly with vendors. |
| Admin role | Verify vendors, manage users, and act on records. Changed from light oversight on 2026-11-07. |
| Data | `data/db.json` seeds a `localStorage` database. No server-side code. |
| Source of truth | The reference image. Brief-only items never change the reference view. |
| Brief-only items | Placed on linked screens or below the reference height. |

## Rules for matching references

- References are 852×1846, rendered at 426×923 CSS px at 2x, so a screenshot can be
  diffed directly. The splash reference is 776×1800, rendered at 388×900.
- The seed data reproduces each reference exactly on first load.
- Each screen is built alone: analyse, build, compare, test, commit, then move on.

## Architecture

| Path | Purpose |
|---|---|
| `index.html` | Mobile app for customers and vendors |
| `admin.html` | Desktop console for admin and staff |
| `js/core/` | Store, router, HTML helper and UI primitives |
| `js/services/` | Business logic, with no DOM access |
| `js/screens/` | One module per screen |
| `css/` | Tokens, base and shared components |
| `tests/` | Unit, end-to-end and visual comparison tests |

Screens call services, and services call the store. Services are asynchronous and
add a short delay, so every screen has real loading and error states.

## Fixing the sample data

The references disagree with each other in places. The seed resolves this so that
each reference still matches:

- **Repeat orders:** Base Plate, L Bracket and Bracket Support have an earlier closed
  enquiry behind each order, so a live enquiry and a finished order can both exist.
- **Demo date:** the app clock is fixed at 15 Mar 2025, which makes "Due in 3 Days
  (18 Mar 2025)" and "Due in 5 Days (20 Mar 2025)" both correct.

## Limits of a browser-only prototype

- Data stays in one browser. Portals share it across tabs, not across devices.
- Passwords are stored unhashed, so only demo values should be used.
- Payments are simulated. No real payment provider is connected.
