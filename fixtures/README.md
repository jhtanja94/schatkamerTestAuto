# Test Fixtures

This directory contains reusable Playwright test fixtures that extend the base test functionality.

## Base Fixture (`base.ts`)

The base fixture automatically handles common setup tasks for all tests:

### Automatic Cookie Dismissal

The fixture automatically dismisses the privacy cookie dialog before each test runs. This means you don't need to manually dismiss cookies in your tests.

```typescript
import { test, expect } from '../fixtures/base';

test('my test', async ({ page }) => {
  // Cookie dialog is already dismissed - start testing immediately!
  await page.goto('https://example.com');
  // ... your test code
});
```

### Usage

To use the fixture in your test files:

```typescript
// Instead of:
import { test, expect } from '@playwright/test';

// Use:
import { test, expect } from '../fixtures/base';
```

### Special Cases

If you need to test the cookie dialog itself (e.g., cookie acceptance tests), simply clear cookies and reload:

```typescript
test('cookie banner visible', async ({ page }) => {
  await page.context().clearCookies();
  await page.reload();
  
  // Now the cookie dialog will appear again
  const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
  await expect(cookieDialog).toBeVisible();
});
```

## Benefits

✅ **Cleaner tests** - No repetitive cookie dismissal code  
✅ **Maintainable** - Change cookie handling in one place  
✅ **Consistent** - All tests handle cookies the same way  
✅ **Automatic** - No need to remember to call helper functions  

## Adding More Fixtures

You can extend the base fixture with additional functionality:

```typescript
export const test = base.extend({
  // Your custom fixtures here
  customFixture: async ({}, use) => {
    // Setup
    const fixture = { /* ... */ };
    await use(fixture);
    // Teardown
  },
});
```


