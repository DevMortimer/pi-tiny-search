# pi-tiny-search

You are working on pi-tiny-search, a Pi extension that gives the agent instant web search and page fetching via Monid/TinyFish. The rules this project follows are in `pi-tiny-search.md`. Read it before making changes.

## Version bumps and changelogs

This is the release protocol. Follow it exactly.

### The rule

**The very last commit on every PR is the version bump commit.** This commit does two things
and nothing else:

1. Bumps the version in `package.json`.
2. Renames the `## Unreleased` heading in `CHANGELOG.md` to `## X.Y.Z` and adds any release
   notes that belong to this version.

PRs are squash-merged, so the squashed commit on `main` carries both the feature work and its
version bump as one atomic unit.

### How to decide the version

Follow semver. For a 0.x project the conventions are:

| Change type | Bump |
| --- | --- |
| New feature, new tool parameter, new config key, anything that changes the public API or behaviour | **minor** (0.1.0 → 0.2.0) |
| Bug fix, threshold tuning, docs-only, internal refactor with no API change | **patch** (0.1.0 → 0.1.1) |
| Breaking change: removed config key, changed export signature, changed tool semantics | **major** (0.1.0 → 1.0.0, or minor if still pre-1.0 and acceptable) |

When in doubt, minor is the right answer. This project moves fast and is still pre-1.0.

### Never commit with unstaged or uncommitted changes

Before committing, run `git status`. If there are unstaged or untracked files, **do not**
commit until you understand what each change is and have decided whether it belongs in this
commit. A dirty tree means something was missed or forgotten. Stage deliberately, not in bulk.

### After merging main

If main was bumped while your PR was in flight (e.g. another PR merged with its own version
bump), the merge brings that new version into your branch. **Your fix still needs its own
bump** — merge main, then bump again. A bug fix on top of 0.2.0 is 0.2.1, not 0.2.0.
The CHANGELOG entry for your fix goes under the new version heading, not under the one the
merge brought in.

### Step by step

1. All feature/fix commits land on the PR branch. Under `CHANGELOG.md`, entries go under
   `## Unreleased` with the appropriate subsection (`### Added`, `### Changed`, `### Fixed`,
   `### Tests`, `### Docs`).

2. The last commit on the PR — the bump commit — does this:

   **package.json:**
   ```json
   "version": "X.Y.Z"
   ```

   **CHANGELOG.md:**
   ```markdown
   ## Unreleased

   <!-- Empty. Next release starts here. -->

   ## X.Y.Z

   ### Added
   - What shipped in this version.

   ### Changed
   - What changed.

   ## 0.1.0
   ...
   ```

   The `## Unreleased` section stays at the top, empty or with future-planning notes.
   The old `## Unreleased` content moves under the new version heading.

3. The commit message for the bump commit:
   ```
   chore: version bump to X.Y.Z
   ```
   Optionally add `, finalize CHANGELOG` or `, sync CONTRIBUTING.md` if those files also
   changed in this commit.

4. Push the branch. The PR is ready to squash-merge.

5. Squash-merge on GitHub — never locally:
   ```
   gh pr merge <number> --squash --delete-branch
   ```
   This closes the PR on GitHub, squash-merges to `main`, and deletes the remote branch
   in one step. **Do not** `git merge --squash` locally and delete the branch by hand — that
   marks the PR as closed (not merged) on GitHub.

6. After merge, pull and tag:
   ```
   git checkout main && git pull origin main
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

### What the bump commit does NOT do

- Does not run `npm version` (that creates its own commit and tag; we manage both manually).
- Does not touch `dist/` (that is built by `npm run build` / `prepack` at publish time).
- Does not publish to npm (that is a separate manual step: `npm publish`).
- Does not change any source code, tests, or behaviour. It is a bookkeeping commit only.

### Example

```
chore: version bump to 0.2.0, finalize CHANGELOG
```

This commit bumped `package.json` from 0.1.0 to 0.2.0, renamed `## Unreleased` to
`## 0.2.0` in the changelog. It was the last commit on the PR.

## Development

```
npm install                     # install dependencies
npm run check                   # typecheck + tests + build (must pass)
npm run test                    # tests only
npm run test:live               # live tests against Monid API (costs real requests)
npm run dev:pi                  # start Pi with this working tree
```

`npm run check` is the gate. It must pass before and after every change.

## Architecture

```
extension.ts          ← Pi hook entry; registers tools, command, session lifecycle
  ├─ config.ts        ← loadConfig, defaultConfig, project/user overrides
  ├─ credentials.ts   ← key storage, env var resolution, permission checks
  ├─ login.ts         ← interactive login prompt, key verification
  ├─ client.ts        ← Monid/TinyFish API client (search + fetch)
  ├─ search.ts        ← tiny_search tool definition and execution
  ├─ fetch.ts         ← tiny_fetch tool definition and execution
  └─ command.ts       ← /tiny-search command handler
```

No runtime dependencies. `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` are
optional peer dependencies. The library has no dependency on Pi's runtime, so every function
is safe to call in tests.

## How the tools work

| Tool | What it does | Returns |
| --- | --- | --- |
| **tiny_search** | Searches the web via TinyFish `/search` endpoint | Structured results: title, url, snippet, site_name |
| **tiny_fetch** | Fetches a URL via TinyFish `/fetch` endpoint | Clean extracted text from the page |

Both tools are fast API calls. No browser, no LLM summarization, no waiting.

## Auth flow

The API key is stored at `~/.pi/agent/pi-tiny-search/auth.json` with owner-only permissions.
Environment variable `TINYSEARCH_API_KEY` takes precedence. The `/tiny-search login` command
prompts for the key, verifies it with a test search, and stores it.

## For extension authors

Every function is a plain TypeScript function. The client, credentials, and login modules
can be used independently of Pi:

```ts
import { createClient } from "pi-tiny-search";
import { keySituation } from "pi-tiny-search/credentials";

const situation = keySituation();
if (situation.kind === "environment" || situation.kind === "stored") {
  const client = createClient({ apiKey: situation.key });
  const results = await client.search({ query: "typescript 5.8" });
}
```

## Publishing

After the bump commit is on `main`:

1. `git pull origin main`
2. `npm run check` (verify clean)
3. `npm publish`
4. `git tag vX.Y.Z && git push origin vX.Y.Z`

The `prepack` script runs `npm run build` automatically, so `dist/` is always fresh.

## Where to ask

Issues on GitHub, or the Pi and TypeSafe Discord servers. Be specific and kind; critique the
code, not the person.
