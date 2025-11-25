# Page-Specific Tests

This directory contains comprehensive test suites for individual pages of the Schatkamer application.

## Purpose

These tests focus on page-specific functionality, layout, and behavior. Each test file corresponds to a specific page or page type in the application.

## Test Files

### `homepage.spec.ts`
Comprehensive tests for the homepage including:
- **Page Load & Basic Elements**: Title, metadata, navigation
- **Search Section**: Search box visibility and functionality
- **Content Sections**: Featured content, images, and sections
- **Footer**: All footer sections, links, newsletter, and attribution
- **Navigation**: Content navigation and breadcrumbs
- **Responsive Design**: Mobile and tablet viewport testing
- **Performance**: Load time and console error monitoring
- **Accessibility**: Heading hierarchy, alt text, and landmark regions

## Running Tests

### Run all page tests
```bash
npx playwright test tests-pages
```

### Run only homepage tests
```bash
npx playwright test tests-pages/homepage.spec.ts
```

### Run specific test suite within homepage
```bash
npx playwright test tests-pages/homepage.spec.ts -g "Footer"
```

### Run in specific browser
```bash
npx playwright test tests-pages --project=chromium
```

### Run in headed mode (see browser)
```bash
npx playwright test tests-pages --headed
```

### Run in debug mode
```bash
npx playwright test tests-pages --debug
```

## Adding New Page Tests

When adding tests for a new page:

1. Create a new file: `[page-name].spec.ts`
2. Import the base fixture: `import { test, expect } from '../fixtures/base'`
3. Define the BASE_URL constant
4. Organize tests into logical `test.describe()` blocks
5. Use descriptive test names that explain what's being tested
6. Follow the existing patterns for consistency

### Example structure:
```typescript
import { test, expect } from '../fixtures/base';

const BASE_URL = 'https://schatkamer-tst.beeldengeluid.nl/';

test.describe('Page Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/your-page-path`);
  });

  test.describe('Section Name', () => {
    test('should do something specific', async ({ page }) => {
      // Test implementation
    });
  });
});
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors
2. **Wait for elements**: Use `expect().toBeVisible()` instead of manual waits
3. **Scope selectors**: Use `.getByRole('contentinfo')` to scope to specific regions
4. **Test user journeys**: Test what users actually do, not implementation details
5. **Keep tests focused**: Each test should verify one specific behavior
6. **Use descriptive names**: Test names should clearly explain what's being tested
7. **Group related tests**: Use `test.describe()` to organize tests logically

## Notes

- Cookie dialogs are automatically dismissed by the base fixture
- Tests use the test environment URL: `https://schatkamer-tst.beeldengeluid.nl/`
- All tests run in parallel by default
- Failed tests automatically capture traces for debugging

