import { test as base, expect, type Page } from '@playwright/test';

/**
 * Extended Playwright test with automatic cookie dismissal.
 * 
 * This fixture wraps `page.goto` so that after every navigation to a page,
 * it will dismiss the privacy cookie dialog if it is present.
 * 
 * Tests that need to interact with the cookie dialog (like cookie acceptance
 * tests) can still do so by:
 * - clearing cookies and using `page.reload()` (which is NOT wrapped), or
 * - importing and calling `dismissCookiesIfPresent(page)` manually.
 */

export async function dismissCookiesIfPresent(page: Page) {
  // Skip if consent was already given in this browser context
  const cookies = await page.context().cookies().catch(() => []);
  const hasConsent = cookies.some(c => c.name === 'OptanonAlertBoxClosed');
  if (hasConsent) return;

  const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
  try {
    // OneTrust injects the dialog asynchronously; wait for it to appear
    await cookieDialog.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    return;
  }

  const refuse = cookieDialog.getByRole('button', { name: /Cookies weigeren|Weigeren/i });
  const accept = cookieDialog.getByRole('button', { name: /Alles accepteren|Accepteren/i });

  if (await refuse.isVisible().catch(() => false)) {
    await refuse.click();
  } else if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }

  await expect(cookieDialog).toBeHidden({ timeout: 5000 });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    // Wrap page.goto so every navigation auto-dismisses cookies afterwards
    const originalGoto = page.goto.bind(page);
    page.goto = (async (...args: Parameters<Page['goto']>) => {
      const response = await originalGoto(...args);
      await dismissCookiesIfPresent(page);
      return response;
    }) as Page['goto'];
    
    // Use the page in the test
    await use(page);
  },
});

export { expect };


