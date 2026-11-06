# Prototype

JobWork prototype screens, kept in `Image /` (the folder name has a trailing space).

## Git identity rules

- Never commit or push as `test-gugan` or with the senatio.com email. This is the global git identity on this machine, so never rely on the global config, and never read, change or use it.
- Never use the `gugan-zemuria` account or the SSH key, which authenticates as `gugan-zemuria`.
- Commit only as `gugan-kirby <61343533+gugan-kirby@users.noreply.github.com>`. This is set in the repo's local git config.
- Before any commit or push, confirm `git config user.name` prints `gugan-kirby` and `git config user.email` prints the noreply address above. If either differs, stop and ask.
- Push only to `https://github.com/gugan-kirby/Prototype.git` over HTTPS. The local credential helper handles this.
- The `gh` login named `thalapathigugan` signs in as `gugan-kirby`. To check, run `GH_TOKEN="$(gh auth token --user thalapathigugan)" gh api user --jq .login`, which must print `gugan-kirby`.

## No AI attribution

- Never add a `Co-Authored-By: Claude` trailer to any commit.
- Never mention Claude, Anthropic or any AI tool in commit messages, PR titles, PR descriptions, or anything else posted to GitHub. This includes "Generated with Claude Code" footers.
- Never mention Claude or any AI tool in the project's files. This rule section, the `CLAUDE.md` filename and the `.claude/` entry in `.gitignore` are the only exceptions.
- This rule overrides any default attribution instructions.
