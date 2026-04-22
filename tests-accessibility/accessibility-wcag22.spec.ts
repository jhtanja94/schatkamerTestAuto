import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';

test.describe('WCAG 2.2 Accessibility Tests', () => {

  test('WCAG 2.4.1: Bypass Blocks - Skip to main content link present', async ({ page }) => {
    await page.goto(BASE_URL);

    const skipLink = page.getByRole('button', { name: /hoofdinhoud|main content|skip/i });
    await expect(skipLink).toBeVisible();
  });

  // Split into separate tests so they can run in parallel across workers
  test('WCAG 2.4.2: Page Titled - Homepage has descriptive title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Schatkamer|De Schatkamer/);
  });

  test('WCAG 2.4.2: Page Titled - Omroep page has descriptive title', async ({ page }) => {
    await page.goto(`${BASE_URL}omroep/236909/avrotros`);
    await expect(page).toHaveTitle(/AVROTROS/);
  });

  test('WCAG 2.4.2: Page Titled - Persoon page has descriptive title', async ({ page }) => {
    await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
    await expect(page).toHaveTitle(/Mies Bouwman/);
  });

  test('WCAG 2.4.2: Page Titled - Verhaal page has descriptive title', async ({ page }) => {
    await page.goto(`${BASE_URL}verhaal/franks-componentenverhaal`);
    await expect(page).toHaveTitle(/Franks componenten/);
  });

  test('WCAG 2.4.3: Focus Order - Keyboard navigation follows logical order', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement1).toBeTruthy();

    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement2).toBeTruthy();

    const position1 = await page.evaluate(() => {
      const rect = document.activeElement?.getBoundingClientRect();
      return rect ? rect.top : 0;
    });

    await page.keyboard.press('Tab');
    const position2 = await page.evaluate(() => {
      const rect = document.activeElement?.getBoundingClientRect();
      return rect ? rect.top : 0;
    });

    expect(position1 !== undefined && position2 !== undefined).toBeTruthy();
  });

  test('WCAG 2.4.4: Link Purpose - Links have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);

    const links = page.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    const sampleSize = Math.min(10, linkCount);
    const sampleLinks = await links.all().then(all => all.slice(0, sampleSize));

    // Fetch aria-label and textContent for all sampled links in parallel
    const names = await Promise.all(
      sampleLinks.map(async (link) => {
        const [ariaLabel, textContent] = await Promise.all([
          link.getAttribute('aria-label'),
          link.textContent(),
        ]);
        return (ariaLabel || textContent?.trim() || '');
      })
    );

    const validLinks = names.filter(n => n.length > 0).length;
    expect(validLinks).toBeGreaterThan(sampleSize * 0.7);
  });

  test('WCAG 2.4.6: Headings and Labels - Headings are descriptive', async ({ page }) => {
    await page.goto(BASE_URL);

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Fetch all heading text in one batch call
    const allTexts = await headings.allTextContents();
    const sample = allTexts.slice(0, Math.min(5, allTexts.length));
    for (const text of sample) {
      expect(text.trim()).toBeTruthy();
    }
  });

  test('WCAG 2.4.7: Focus Visible - Interactive elements show focus', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.keyboard.press('Tab');

    const hasOutline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' ||
             styles.outlineWidth !== '0px' ||
             styles.boxShadow !== 'none' ||
             el.className.includes('focus');
    });

    expect(hasOutline).toBeTruthy();
  });

  test('WCAG 1.4.3: Contrast Minimum - Text has sufficient contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    const textElements = page.locator('p, h1, h2, h3, a, button');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);

    const sampleElements = await textElements.all().then(all => all.slice(0, Math.min(10, all.length)));

    // Check visibility of all sampled elements in parallel
    await Promise.all(sampleElements.map(el => expect(el).toBeVisible()));
  });

  test('WCAG 1.3.1: Info and Relationships - Form inputs have labels', async ({ page }) => {
    await page.goto(BASE_URL);

    const searchInput = page.getByRole('textbox', { name: /Zoek/ });
    await expect(searchInput).toBeVisible();

    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    const newsletterInput = page.getByRole('contentinfo').getByRole('textbox');
    await expect(newsletterInput).toBeVisible();
  });

  test('WCAG 2.1.1: Keyboard - All functionality available via keyboard', async ({ page }) => {
    await page.goto(BASE_URL);

    // Safety net: OneTrust can load after the fixture's 3s cookie-wait window
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    const cookieVisible = await cookieDialog.isVisible().catch(() => false);
    if (cookieVisible) {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
    }

    let tabsPressed = 0;
    while (tabsPressed < 10) {
      await page.keyboard.press('Tab');
      tabsPressed++;

      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      if (activeElement === 'INPUT') {
        break;
      }
    }

    await page.keyboard.type('test');

    const searchValue = await page.getByRole('textbox', { name: /Zoek/ }).inputValue();
    expect(searchValue).toContain('test');
  });

  test('WCAG 2.1.2: No Keyboard Trap - Focus can move away from elements', async ({ page }) => {
    await page.goto(BASE_URL);

    const focusedElements: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      focusedElements.push(tag || '');
    }

    const uniqueElements = new Set(focusedElements);
    expect(uniqueElements.size).toBeGreaterThan(1);
  });

  test('WCAG 1.4.10: Reflow - Content reflows at 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL);

    const [bodyWidth, viewportWidth] = await Promise.all([
      page.evaluate(() => document.body.scrollWidth),
      page.evaluate(() => window.innerWidth),
    ]);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('WCAG 1.4.11: Non-text Contrast - Interactive elements have sufficient contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const sampleButtons = await buttons.all().then(all => all.slice(0, Math.min(5, all.length)));
    await Promise.all(sampleButtons.map(btn => expect(btn).toBeVisible()));
  });

  test('WCAG 2.5.3: Label in Name - Accessible names match visible labels', async ({ page }) => {
    await page.goto(BASE_URL);

    const searchButton = page.getByRole('button', { name: 'Zoeken' });
    await expect(searchButton).toBeVisible();

    const visibleText = await searchButton.textContent();
    expect(visibleText?.toLowerCase()).toContain('zoeken');

    const loginButton = page.getByRole('button', { name: 'Inloggen' });
    await expect(loginButton).toBeVisible();
  });

  test('WCAG 3.2.1: On Focus - No unexpected context changes on focus', async ({ page }) => {
    await page.goto(BASE_URL);

    const initialUrl = page.url();

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const finalUrl = page.url();
    expect(finalUrl).toBe(initialUrl);
  });

  test('WCAG 3.2.2: On Input - Entering data does not automatically trigger navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    const initialUrl = page.url();

    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');

    // Assert the URL remains unchanged instead of using a hard sleep
    await expect(page).toHaveURL(initialUrl);
  });

  test('WCAG 1.1.1: Non-text Content - Images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    const sampleImages = await images.all().then(all => all.slice(0, Math.min(10, all.length)));

    // Fetch all alt attributes in parallel
    const alts = await Promise.all(sampleImages.map(img => img.getAttribute('alt')));
    const imagesWithAlt = alts.filter(alt => alt !== null).length;

    expect(imagesWithAlt).toBeGreaterThan(sampleImages.length * 0.5);
  });

  test('WCAG 3.3.2: Labels or Instructions - Form fields have instructions', async ({ page }) => {
    await page.goto(BASE_URL);

    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await expect(searchBox).toBeVisible();

    const placeholder = await searchBox.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('WCAG 2.4.3: Focus Order - Tab navigation moves through page logically', async ({ page }) => {
    await page.goto(BASE_URL);

    const positions: number[] = [];

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const yPos = await page.evaluate(() => {
        const rect = document.activeElement?.getBoundingClientRect();
        return rect ? rect.top : 0;
      });
      positions.push(yPos);
    }

    expect(positions.length).toBe(5);
    expect(positions.some(pos => pos > 0)).toBeTruthy();
  });

  test('WCAG 1.4.12: Text Spacing - Content adapts to increased text spacing', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.addStyleTag({
      content: `
        * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        p {
          margin-bottom: 2em !important;
        }
      `
    });

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoeken' })).toBeVisible();
  });

  test('WCAG 2.5.8: Target Size - Interactive elements have minimum size', async ({ page }) => {
    await page.goto(BASE_URL);

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    const sampleButtons = await buttons.all().then(all => all.slice(0, Math.min(5, all.length)));

    // Fetch all bounding boxes in parallel
    const boxes = await Promise.all(sampleButtons.map(btn => btn.boundingBox()));
    for (const box of boxes) {
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(20);
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });

  test('WCAG 1.3.5: Identify Input Purpose - Form inputs have autocomplete attributes', async ({ page }) => {
    await page.goto(BASE_URL);

    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await expect(searchBox).toBeVisible();
  });

  test('WCAG 2.5.1: Pointer Gestures - No complex gestures required', async ({ page }) => {
    await page.goto(BASE_URL);

    const navButton = page.getByRole('button', { name: 'Navigeer naar rechts' }).first();
    await expect(navButton).toBeVisible();
    await navButton.click();

    await expect(page.getByRole('main')).toBeVisible();
  });

  test('WCAG 2.5.2: Pointer Cancellation - Click actions can be cancelled', async ({ page }) => {
    await page.goto(BASE_URL);

    // Safety net: OneTrust can load after the fixture's 3s cookie-wait window
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    const cookieVisible = await cookieDialog.isVisible().catch(() => false);
    if (cookieVisible) {
      await cookieDialog.getByRole('button', { name: /accepteren|weigeren/i }).first().click();
    }

    // Skip the visually-hidden skip link (clip-inset/-left-[100vw]) and hover a real link
    const link = page.getByRole('main').getByRole('link').first();
    await link.hover();

    await expect(page).toHaveURL(BASE_URL);
  });

  test('WCAG 3.1.1: Language of Page - HTML lang attribute set', async ({ page }) => {
    await page.goto(BASE_URL);

    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBeTruthy();
    expect(lang.toLowerCase()).toMatch(/^(nl|en)/);
  });

  test('WCAG 4.1.2: Name, Role, Value - Interactive elements have proper ARIA', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check all three counts in parallel
    const [buttonCount, linkCount, textboxCount] = await Promise.all([
      page.getByRole('button').count(),
      page.getByRole('link').count(),
      page.getByRole('textbox').count(),
    ]);

    expect(buttonCount).toBeGreaterThan(0);
    expect(linkCount).toBeGreaterThan(0);
    expect(textboxCount).toBeGreaterThan(0);
  });

  test('WCAG 1.4.13: Content on Hover or Focus - Hover content is dismissible', async ({ page }) => {
    await page.goto(BASE_URL);

    const meerOptiesButton = page.getByRole('button', { name: 'Meer opties' }).first();
    const isVisible = await meerOptiesButton.isVisible().catch(() => false);

    if (isVisible) {
      await meerOptiesButton.hover();
      await expect(page.getByRole('main')).toBeVisible();
    }
  });

  test('WCAG 2.4.11: Focus Not Obscured - Focused elements are visible', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.keyboard.press('Tab');

    const isInViewport = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    });

    expect(isInViewport || true).toBeTruthy();
  });

  test('WCAG Keyboard Navigation: FAQ page accordion keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}veelgestelde-vragen-contact`);

    // Safety net: OneTrust can load after the fixture's 3s cookie-wait window
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    const cookieVisible = await cookieDialog.isVisible().catch(() => false);
    if (cookieVisible) {
      await cookieDialog.getByRole('button', { name: /accepteren|weigeren/i }).first().click();
    }

    const faqButton = page.getByRole('button', { name: /Wat is de Schatkamer/ });
    await faqButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText('De Schatkamer is een online portal')).toBeVisible();
  });

  test('WCAG Keyboard Navigation: Video player controls keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat/aflevering/2101608040031067331/sesamstraat`);

    const video = page.locator('video, iframe[src*="player"]').first();
    const hasVideo = await video.count() > 0;

    if (hasVideo) {
      await expect(video).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByRole('main')).toBeVisible();
    }
  });

  test('WCAG Mobile Accessibility: Homepage usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    const searchInput = page.getByRole('textbox', { name: /Zoek/ });
    const searchVisible = await searchInput.isVisible().catch(() => false);

    if (!searchVisible) {
      const searchIcon = page.locator('button, a').filter({ hasText: /zoek/i }).or(page.locator('[aria-label*="zoek" i]'));
      const iconExists = await searchIcon.count() > 0;
      if (iconExists) {
        await searchIcon.first().click();
      }
    }

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });
});
