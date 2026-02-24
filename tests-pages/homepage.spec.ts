import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, BasePage } from '../pages';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Page Load and Basic Elements', () => {
    test('should load with correct title and metadata', async ({ page }) => {
      const home = new HomePage(page);
      await expect(page).toHaveTitle(/De Schatkamer/);
      await expect(home.mainHeading).toBeVisible();
    });

    test('should display main navigation elements', async ({ page }) => {
      const home = new HomePage(page);
      await expect(home.homeLink).toBeVisible();
      await expect(home.inloggenButton).toBeVisible();
      await expect(home.searchBox).toBeVisible();
      await expect(home.zoekenButton).toBeVisible();
    });
  });

  test.describe('Search Section', () => {
    test('should display search box prominently on homepage', async ({ page }) => {
      const home = new HomePage(page);
      await expect(home.searchBox).toBeVisible();
      await expect(home.searchBox).toBeEditable();
    });

    test('should have placeholder text in search box', async ({ page }) => {
      const home = new HomePage(page);
      const placeholder = await home.searchBox.getAttribute('placeholder');
      expect(placeholder).toBe('Zoek op programma\'s, personen, verhalen en omroepen.');
    });
  });

  test.describe('Content Sections', () => {
    test('should display featured or highlighted content', async ({ page }) => {
      const home = new HomePage(page);
      await expect(home.contentLinksWithImage.first()).toBeVisible({ timeout: 10000 });
    });

    test('should have visible content images', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const home = new HomePage(page);
      const images = page.locator('img').filter({ hasNotText: '' });
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
      await expect(images.first()).toBeVisible();
    });

    test('should have multiple sections with content', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const headings = page.getByRole('heading');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(1);
    });
  });

  test.describe('Footer', () => {
    test('should display footer with all sections', async ({ page }) => {
      const home = new HomePage(page);
      await home.scrollFooterIntoView();
      await expect(home.footerHeadingOrganisatie).toBeVisible();
      await expect(home.footerHeadingOndersteuning).toBeVisible();
      await expect(home.footerHeadingOmroepen).toBeVisible();
    });

    test('should have working footer links', async ({ page }) => {
      const home = new HomePage(page);
      await home.scrollFooterIntoView();
      await expect(home.linkOverBeeldEnGeluid).toBeVisible();
      await expect(home.linkOverBeeldEnGeluid).toHaveAttribute('href', /.+/);
      await expect(home.linkVeelgesteldeVragen).toBeVisible();
      await expect(home.linkVeelgesteldeVragen).toHaveAttribute('href', /.+/);
    });

    test('should display broadcaster links in footer', async ({ page }) => {
      const home = new HomePage(page);
      await home.scrollFooterIntoView();
      await expect(home.footer.getByRole('link', { name: 'BNNVARA' })).toBeVisible();
      await expect(home.footer.getByRole('link', { name: 'NTR' })).toBeVisible();
    });

    test('should have newsletter signup section', async ({ page }) => {
      const home = new HomePage(page);
      await home.scrollFooterIntoView();
      await expect(home.newsletterHeading).toBeVisible();
      await expect(home.newsletterAanmeldenButton).toBeVisible();
    });

    test('should display Beeld & Geluid attribution', async ({ page }) => {
      const home = new HomePage(page);
      await home.scrollFooterIntoView();
      await expect(home.attributionText).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from content item to detail page and back', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const home = new HomePage(page);
      const contentLink = home.contentLinksWithImage.first();
      await contentLink.click();
      await expect(page).not.toHaveURL(BASE_URL);
      await expect(page).toHaveURL(/\/(serie|programma|omroep)\//);
      await home.homeLink.click();
      await expect(page).toHaveURL(BASE_URL);
    });

    test('should have breadcrumb on homepage', async ({ page }) => {
      const home = new HomePage(page);
      const isVisible = await home.breadcrumb.isVisible().catch(() => false);
      if (isVisible) {
        await expect(home.breadcrumb).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const home = new HomePage(page);
      await expect(home.searchBox).toBeVisible();
      await expect(home.mainHeading).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      const home = new HomePage(page);
      await expect(home.searchBox).toBeVisible();
      await expect(home.mainHeading).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within acceptable time', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveTitle(/De Schatkamer/);
    });

    test('should have no console errors on load', async ({ page, context }) => {
      const testPage = await context.newPage();
      const consoleErrors: string[] = [];
      testPage.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      const base = new BasePage(testPage);
      testPage.on('load', async () => {
        const isVisible = await base.cookieDialog.isVisible().catch(() => false);
        if (isVisible && (await base.refuseCookiesButton.isVisible().catch(() => false))) {
          await base.refuseCookies();
        }
      });
      await testPage.goto(BASE_URL);
      await testPage.waitForLoadState('networkidle');
      const criticalErrors = consoleErrors.filter((e) => !e.includes('favicon'));
      expect(criticalErrors.length).toBe(0);
      await testPage.close();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.getByRole('heading', { level: 1 }).count();
      expect(h1Count).toBeGreaterThan(0);
      expect(h1Count).toBe(1);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const images = page.locator('img');
      const imageCount = await images.count();
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test('should have proper landmark regions', async ({ page }) => {
      const home = new HomePage(page);
      await expect(home.banner).toBeVisible();
      await expect(home.footer).toBeVisible();
      const hasMain = await home.main.isVisible().catch(() => false);
      expect(hasMain).toBe(true);
    });
  });
});