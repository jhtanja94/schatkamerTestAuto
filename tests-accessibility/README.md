# Accessibility Tests

This directory contains WCAG 2.2 accessibility tests that are run separately from the main test suite.

## Running Accessibility Tests

To run only the accessibility tests:

```bash
npx playwright test tests-accessibility
```

To run accessibility tests on a specific browser:

```bash
npx playwright test tests-accessibility --project=chromium
```

To run with UI mode:

```bash
npx playwright test tests-accessibility --ui
```

## Why Separate?

These tests are separated because:
- They are comprehensive and take longer to run
- They focus specifically on WCAG 2.2 compliance
- They can be run on-demand rather than with every test run

