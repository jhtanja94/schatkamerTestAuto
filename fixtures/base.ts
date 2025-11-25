import { test as base, expect } from '@playwright/test';

/**
 * Extended Playwright test with automatic cookie dismissal
 * 
 * This fixture automatically dismisses the privacy cookie dialog before each test.
 * Tests that need to interact with the cookie dialog (like cookie acceptance tests)
 * should clear cookies and reload the page to see the dialog again.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Automatically dismiss cookies if the dialog is present
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    const isVisible = await cookieDialog.isVisible().catch(() => false);
    
    if (isVisible) {
      const refuse = cookieDialog.getByRole('button', { name: /Cookies weigeren|Weigeren/i });
      const accept = cookieDialog.getByRole('button', { name: /Alles accepteren|Accepteren/i });
      
      if (await refuse.isVisible().catch(() => false)) {
        await refuse.click();
      } else if (await accept.isVisible().catch(() => false)) {
        await accept.click();
      }
      
      await expect(cookieDialog).toBeHidden();
    }
    
    // Use the page in the test
    await use(page);
  },
});

export { expect };


