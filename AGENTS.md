# AGENTS.md

## Overview

This is a Playwright E2E test automation suite for **De Schatkamer** (Netherlands Institute for Sound & Vision media archive). There is no local application to run — all tests target the remote test environment at `https://schatkamer-tst.beeldengeluid.nl/`.

## Cursor Cloud specific instructions

### Target site access

The test environment (`schatkamer-tst.beeldengeluid.nl`) is protected by **CloudFront signed cookies** (Key-Pair-Id). Without valid signed cookies/credentials, the site returns HTTP 403. Tests will fail if the VM does not have access to the site.

### Running tests

- **Main regression tests:** `npx playwright test` (runs `tests/` directory on all configured browser projects)
- **Specific directory:** `npx playwright test tests-pages` or `tests-accessibility` or `tests-experiments`
- **Single browser:** add `--project=chromium` (or `webkit`, `Mobile Chrome`)
- **Single test by name:** `npx playwright test -g "test name pattern"`
- See `tests-pages/README.md`, `tests-accessibility/README.md`, and `tests-experiments/README.md` for directory-specific instructions.

### Browser projects configured

Chromium (Desktop Chrome), WebKit (Desktop Safari), and Mobile Chrome (Pixel 5). Firefox is commented out in `playwright.config.ts`.

### No lint/build step

This project has no linter, build step, or `tsconfig.json` configured. Playwright handles TypeScript natively. There are no `scripts` entries in `package.json`.

### Cookie handling

Tests import from `fixtures/base.ts` which auto-dismisses the cookie consent dialog on every `page.goto()` call. Tests that need to interact with the cookie dialog clear cookies and use `page.reload()` instead.
