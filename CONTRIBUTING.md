# Contributing to pi-tiny-search

Thanks for your interest in contributing. This document covers the workflow and coding standards.

## Getting started

```
git clone https://github.com/DevMortimer/pi-tiny-search.git
cd pi-tiny-search
npm install
npm run check
```

`npm run check` runs typecheck, tests, and build. It must pass before you push.

## Branching

Create a feature branch from `main`:

```
git checkout -b feature/short-description
```

Keep branch names short and descriptive: `feature/rate-limit-backoff`, `fix/fetch-timeout`.

## Commits

Write clear commit messages. The subject line is imperative mood, under 72 characters:

```
Add exponential backoff for 429 responses
```

```
Fix fetch timeout not propagating to agent
```

Do not commit with unstaged or uncommitted changes. Run `git status` before committing.
Stage deliberately, not in bulk.

## Pull requests

1. All feature/fix commits land on the PR branch.
2. The **last commit** on the PR is the version bump (see AGENTS.md).
3. Push the branch and open a PR against `main`.
4. Squash-merge on GitHub: `gh pr merge <number> --squash --delete-branch`.

## Coding style

- TypeScript strict mode. No `any` unless unavoidable (and documented why).
- Prefer `readonly` on function parameters and return types where the value is not mutated.
- Error messages start with a capital letter and end without a period.
- Every exported function has a JSDoc comment stating what it does, not what it is.
- No `console.log` in production code. Use the extension's notification or trace system.
- imports are grouped: node builtins, external packages, internal modules. Separated by blank lines.

## Testing

- Unit tests go in `tests/`. Name them `<module>.test.ts`.
- Tests must be offline by default. No network calls unless the test is explicitly live.
- Live tests use `npm run test:live` and require a `.env` with `MONID_API_KEY`.
- Every new public function gets at least one test.

## What we review

- Does the change match the project rules in `pi-tiny-search.md`?
- Does `npm run check` pass?
- Is the diff minimal? Does it change only what the PR description says?
- Are error cases handled, not just the happy path?
- Is the API key safe? No leaks in logs, error messages, or trace entries.

## Code of conduct

Be kind. Be specific. Critique the code, not the person.
