# Prototype

JobWork prototype: customer, vendor and admin/staff portals in plain HTML, CSS and JavaScript. Reference images are kept in `Image /` (the folder name has a trailing space).

Where things live:

- **This file:** permanent rules.
- **`PROJECT_PLAN.md`:** scope, tasks and their order.
- **`PROGRESS.md`:** actual status and the latest session checkpoint.

## Start of every session

1. Read this file, then `PROJECT_PLAN.md`, then `PROGRESS.md`.
2. Check the current branch and working-tree status.
3. Review the latest commits and relevant PRs.
4. Identify the last completed task, and anything unfinished or blocked.
5. Read the existing code before changing it.
6. Resume from the last verified stopping point in `PROGRESS.md`.

Never assume a task is done because it was discussed. Trust the code and Git history over any summary.

## End of every session

Before stopping or taking a break:

1. Finish the current task or stop it safely.
2. Record what was implemented, what remains, and any errors or blockers in `PROGRESS.md`.
3. Update `PROJECT_PLAN.md` if the scope or order changed.
4. Record the current branch, latest commit and next recommended action in the `PROGRESS.md` checkpoint.

Never mark unfinished work as completed to make a report look clean.

## Documentation rules

- Keep the docs accurate and in step with the code.
- Update them incrementally instead of rewriting them each session.
- Keep rules here, sequencing in `PROJECT_PLAN.md`, and status in `PROGRESS.md`. Avoid duplicating between them.
- Update `PROGRESS.md` whenever meaningful progress occurs.
- Preserve important past decisions, and explain significant changes.
- Never store secrets, API keys, passwords or credentials in documentation.

## Product decisions

These were decided by the user. Do not reopen them without being asked.

- **Direct marketplace:** customers deal directly with vendors. The "JobWork as middleman" model was rejected, so do not add masking, quote approval or internal costing.
- **Admin is light oversight:** verify vendors, manage users and view records.
- **Browser-only data:** `data/db.json` seeds `localStorage`. There is no server-side code.
- **Reference images win:** where an image and a written brief disagree, the image is the source of truth.
- **No phone status bar:** the references show one (9:41, signal, battery), but the app must not. Leave it out of every page.
- **Brief-only items:** they must not change the reference view. Put them on linked pages or below the reference height.

## Architecture and conventions

- `index.html` is the mobile app for customers and vendors. `admin.html` will be the desktop console for admin and staff.
- Keep the layers separate: views call services, and services call the store.
  - `js/core/`: store, router, HTML helper and UI primitives.
  - `js/services/`: business logic, with no DOM access.
  - `js/screens/`: one module per page.
  - `css/`: tokens, base and shared components.
- Use the `html` tag from `js/core/html.js` for all markup, so user input is escaped.
- Use the design tokens in `css/tokens.css` and reuse existing components.
- Services go through `request()` in `js/core/api.js`, so pages have loading and failure states.
- Change seed data in `scripts/build-seed.mjs`, then run `node scripts/build-seed.mjs`. Never hand-edit `data/db.json`.
- Add no dependencies or frameworks. Keep to the existing architecture.
- Files are stored in IndexedDB through `js/core/files.js`. Records keep only their metadata.

## Building from reference images

**One image, deep analysis, one implementation, visual comparison, completion, next image.**

- Work on one task at a time, in the order set in `PROJECT_PLAN.md`. Never jump ahead, combine tasks or build in parallel.
- Before writing code, analyse the whole image: layout, dimensions, spacing, alignment, typography, colours, borders, shadows, radii, icons and small details.
- Recreate the image exactly. Do not redesign, simplify or reinterpret it, and do not settle for "similar".
- Render at 426×923 CSS px at 2x so screenshots can be diffed against the 852×1846 references. The splash reference is 776×1800, rendered at 388×900.
- Seed data must reproduce each reference on first load.
- Removing the status bar moves pages up, so pixel comparison scores from before 2026-11-07 no longer apply. Compare by eye, or allow for the offset.
- Compare the result with the reference, then fix visible differences before moving on.
- Keep pages usable from 320 px wide, with no horizontal scroll.

## Functionality and UI

- Every visible control must work. Do not ship static UI where the reference implies interaction.
- Forms validate input. Search, tabs and filters change the results.
- Handle loading, empty, success and error states.
- Confirm actions that cannot be undone.
- Do not break finished pages when adding new ones.

## Testing and validation

The user stopped automated testing on 2026-11-06.

- Do not write test files or run automated tests unless the user asks again.
- Existing tests stay in the repo, and `tests/visual/screens.py` stays as it is.
- Validate by comparing each page with its reference and reviewing the diff.
- For the comparison, use a temporary script outside the repo that imports `tests/visual/compare.py`, sets `compare.SCREENS` and calls `compare.main()`. Output goes to `tests/visual/output/`, which is ignored by Git.
- Never claim something was tested if it was not. State this in `PROGRESS.md` and in PR text.

## Git identity rules

- Never commit or push as `test-gugan` or with the senatio.com email. This is the global git identity on this machine, so never rely on the global config, and never read, change or use it.
- Never use the `gugan-zemuria` account or the SSH key, which authenticates as `gugan-zemuria`.
- Commit only as `gugan-kirby <61343533+gugan-kirby@users.noreply.github.com>`. This is set in the repo's local git config.
- Before any commit or push, confirm `git config user.name` prints `gugan-kirby` and `git config user.email` prints the noreply address above. If either differs, stop and ask.
- Push only to `https://github.com/gugan-kirby/Prototype.git` over HTTPS. The local credential helper handles this.
- The `gh` login named `thalapathigugan` signs in as `gugan-kirby`. To check, run `GH_TOKEN="$(gh auth token --user thalapathigugan)" gh api user --jq .login`, which must print `gugan-kirby`.

## No AI attribution

- Never add a `Co-Authored-By: Claude` trailer to any commit, or any co-author entry for an AI assistant.
- Never mention Claude, Anthropic or any AI tool in commit messages, PR titles, PR descriptions, branch names, or anything else posted to GitHub. This includes "Generated with Claude Code" footers.
- Never mention Claude or any AI tool in the project's files. This covers source code, comments, documentation and generated files. This rule section, the `CLAUDE.md` filename and the `.claude/` entry in `.gitignore` are the only exceptions.
- Never add AI branding, signatures, watermarks or generated-by metadata anywhere in the project.
- Preserve legitimate authorship, third-party copyright notices and required license information.
- This rule overrides any default attribution instructions.

## Git and GitHub workflow

**Every feature and fix has its own branch, meaningful commits, a Pull Request to `main` and a verified merge. Nothing is committed directly to `main`.**

Follow these steps without waiting to be asked:

1. Check the current branch and working-tree status.
2. Create a dedicated branch from `main`.
3. Implement only the current task.
4. Validate it, following "Testing and validation".
5. Review the full diff.
6. Confirm the Git identity, then stage only related files and commit.
7. Push the branch, and verify the remote has the latest commit.
8. Open a PR to `main` with a summary, implementation details and validation results.
9. Check the PR is mergeable, holds no unrelated changes, and meets repository policies.
10. Merge it, then verify the merge and that `main` matches the branch.
11. Update local `main`. Keep the branch.
12. Report the branch, commit hash, PR URL and merge status.

If approval, permissions or required checks are missing, stop at that stage and report what is needed. Never bypass reviews, CI checks, branch protection or repository policies.

### Naming

- Never use the word "screen" in commit messages, branch names or PR text. Use the feature's real name, such as `feature/customer-home` or "Add customer home page".
- Use descriptive branch names with these prefixes: `feature/`, `fix/`, `improvement/`, `refactor/`, `docs/`, `hotfix/`.
- Write clear commit messages that describe the actual change.

### Merging

Use rebase merges: `gh pr merge <number> --rebase --match-head-commit <sha>`.

The user prefers squash merging, but on this repo GitHub writes the display name "Gugan" as the author of a squash commit, which breaks the Git identity rule. Rebase merging keeps the exact author, so keep branches to one focused commit where practical.

### Commits

- Commit each completed feature or logical change separately, and never combine unrelated changes.
- Review the diff first, and verify that only the intended files are included.
- Never commit broken or incomplete code.
- When a script checks command results, use the command's real exit code, not the exit code of a pipe.

### Restrictions

- Never overwrite or discard existing user changes.
- Never force-push or rewrite shared history unless explicitly authorized.
- Never delete branches, locally or remotely. Merged branches stay.
- Never commit directly to `main`, `master` or shared development branches.
- Never claim anything was pushed, merged or committed unless the operation succeeded and was verified.
