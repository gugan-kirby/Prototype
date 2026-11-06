# Prototype

JobWork prototype: customer, vendor and admin portals built with HTML, CSS and
JavaScript. Data is seeded from `data/db.json` and saved in `localStorage`.

## Run

The app must be served over HTTP:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Documentation

- `PROJECT_PLAN.md`: scope and task order.
- `PROGRESS.md`: current status and where to resume.
- `docs/specs/`: the original design.

## Test

```sh
npm test
python3 tests/e2e/run.py
python3 tests/visual/compare.py
```

The browser tests need Python with Playwright and Pillow.
