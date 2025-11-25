# Experimental Tests

This directory contains experimental tests that are under development or testing new approaches.

## Test Files

### `search-dynamic.spec.ts`
Dynamic search functionality tests with randomized inputs and various edge cases.


## Running Experimental Tests

To run only the experimental tests:

```bash
npx playwright test tests-experiments
```

To run experimental tests on a specific browser:

```bash
npx playwright test tests-experiments --project=chromium
```

To run with UI mode:

```bash
npx playwright test tests-experiments --ui
```

### Run specific test file

```bash
# Run only player error handling tests
npx playwright test tests-experiments/player-error-handling.spec.ts

# Run only 403 error tests
npx playwright test tests-experiments/player-error-handling.spec.ts -g "403"

# Run with headed mode to see browser
npx playwright test tests-experiments/player-error-handling.spec.ts --headed
```

## Why Separate?

These tests are separated because:
- They are experimental and may not be stable
- They test new approaches or features
- They don't need to run with every regular test execution

