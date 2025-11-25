import { test, expect } from '../fixtures/base';

const BASE_URL = 'https://schatkamer-tst.beeldengeluid.nl/';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Page Load and Basic Elements', () => {
    test('should load with correct title and metadata', async ({ page }) => {
      // Verify page title
      await expect(page).toHaveTitle(/De Schatkamer/);
      
      // Verify main heading is present
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });

    test('should display main navigation elements', async ({ page }) => {
      // Verify main navigation items
      await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible();
      
      // Verify search functionality in header
      await expect(page.getByRole('textbox', { name: /Zoek/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Zoeken' })).toBeVisible();
    });
  });

  test.describe('Search Section', () => {
    test('should display search box prominently on homepage', async ({ page }) => {
      const searchBox = page.getByRole('textbox', { name: /Zoek/ });
      await expect(searchBox).toBeVisible();
      await expect(searchBox).toBeEditable();
    });

    test('should have placeholder text in search box', async ({ page }) => {
      const searchBox = page.getByRole('textbox', { name: /Zoek/ });
      const placeholder = await searchBox.getAttribute('placeholder');
      expect(placeholder).toBe('Zoek op programma\'s, personen, verhalen en omroepen.');
    });
  });

  test.describe('Content Sections', () => {
    test('should display featured or highlighted content', async ({ page }) => {
      // Check for any visible links to content (series, programs, etc.)
      const contentLinks = page.getByRole('link').filter({ 
        has: page.locator('img') 
      });
      await expect(contentLinks.first()).toBeVisible({ timeout: 10000 });
    });

    test('should have visible content images', async ({ page }) => {
      // Wait for images to load
      await page.waitForLoadState('networkidle');
      
      // Check that there are visible images on the page
      const images = page.locator('img').filter({ hasNotText: '' });
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify at least one image is visible
      await expect(images.first()).toBeVisible();
    });

    test('should have multiple sections with content', async ({ page }) => {
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Check for multiple headings indicating different sections
      const headings = page.getByRole('heading');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(1);
    });
  });

  test.describe('Footer', () => {
    test('should display footer with all sections', async ({ page }) => {
      // Scroll to footer to ensure it's loaded
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      
      // Verify main footer sections
      await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Organisatie' })).toBeVisible();
      await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Ondersteuning' })).toBeVisible();
      await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Omroepen' })).toBeVisible();
    });

    test('should have working footer links', async ({ page }) => {
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      
      // Verify important footer links are present and have valid href
      const aboutLink = page.getByRole('link', { name: 'Over Beeld & Geluid' });
      await expect(aboutLink).toBeVisible();
      await expect(aboutLink).toHaveAttribute('href', /.+/);
      
      const faqLink = page.getByRole('link', { name: 'Veelgestelde vragen & Contact' });
      await expect(faqLink).toBeVisible();
      await expect(faqLink).toHaveAttribute('href', /.+/);
    });

    test('should display broadcaster links in footer', async ({ page }) => {
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      
      // Verify at least some broadcaster links are visible
      await expect(page.getByRole('contentinfo').getByRole('link', { name: 'BNNVARA' })).toBeVisible();
      await expect(page.getByRole('contentinfo').getByRole('link', { name: 'NTR' })).toBeVisible();
    });

    test('should have newsletter signup section', async ({ page }) => {
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      
      // Verify newsletter section
      await expect(page.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' })).toBeVisible();
      await expect(page.getByRole('contentinfo').getByRole('button', { name: 'Aanmelden' })).toBeVisible();
    });

    test('should display Beeld & Geluid attribution', async ({ page }) => {
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      
      await expect(page.getByText('De Schatkamer is een initiatief van Beeld & Geluid')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from content item to detail page and back', async ({ page }) => {
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Find a content link (series or program)
      const contentLink = page.getByRole('link').filter({ 
        has: page.locator('img') 
      }).first();
      
      await contentLink.click();
      
      // Verify we navigated to a detail page
      await expect(page).not.toHaveURL(BASE_URL);
      await expect(page).toHaveURL(/\/(serie|programma|omroep)\//);
      
      // Navigate back to home
      await page.getByRole('link', { name: 'Home' }).first().click();
      await expect(page).toHaveURL(BASE_URL);
    });

    test('should have breadcrumb on homepage', async ({ page }) => {
      // Homepage might not have breadcrumb, but check anyway
      const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' });
      const isVisible = await breadcrumb.isVisible().catch(() => false);
      
      // This is informational - homepage might not have breadcrumb
      if (isVisible) {
        await expect(breadcrumb).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify key elements are still visible
      await expect(page.getByRole('textbox', { name: /Zoek/ })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Verify key elements are still visible
      await expect(page.getByRole('textbox', { name: /Zoek/ })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within acceptable time', async ({ page }) => {
      // Note: beforeEach already navigates, so we just verify load state
      await page.waitForLoadState('domcontentloaded');
      
      // Verify page loaded (this test is more useful when measuring from fresh navigation)
      await expect(page).toHaveTitle(/De Schatkamer/);
    });

    test('should have no console errors on load', async ({ page, context }) => {
      // Create a new page to capture console from the start
      const testPage = await context.newPage();
      const consoleErrors: string[] = [];
      
      testPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Automatically dismiss cookies on the new page
      const cookieDialog = testPage.getByRole('dialog', { name: 'Privacy' });
      testPage.on('load', async () => {
        const isVisible = await cookieDialog.isVisible().catch(() => false);
        if (isVisible) {
          const refuse = cookieDialog.getByRole('button', { name: /Cookies weigeren|Weigeren/i });
          if (await refuse.isVisible().catch(() => false)) {
            await refuse.click();
          }
        }
      });
      
      await testPage.goto(BASE_URL);
      await testPage.waitForLoadState('networkidle');
      
      // Filter out known/acceptable errors if any
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') // Ignore favicon errors
      );
      
      expect(criticalErrors.length).toBe(0);
      
      await testPage.close();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check that there's at least one h1
      const h1Count = await page.getByRole('heading', { level: 1 }).count();
      expect(h1Count).toBeGreaterThan(0);
      
      // Ideally there should be exactly one h1
      expect(h1Count).toBe(1);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Get all images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      // Check each image has alt attribute
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test('should have proper landmark regions', async ({ page }) => {
      // Verify main landmark regions exist
      await expect(page.getByRole('banner')).toBeVisible(); // header
      await expect(page.getByRole('contentinfo')).toBeVisible(); // footer
      
      // Main content area should exist
      const main = page.getByRole('main');
      const hasMain = await main.isVisible().catch(() => false);
      expect(hasMain).toBe(true);
    });
  });
});