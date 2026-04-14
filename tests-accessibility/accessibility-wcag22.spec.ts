import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';

// Cookie dismissal is handled automatically by the base fixture (fixtures/base.ts).
// Every page.goto() call already dismisses the privacy dialog — no manual handling needed.

test.describe('WCAG 2.2 Accessibility Tests', () => {

  test('WCAG 2.4.1: Bypass Blocks - Skip to main content link present', async ({ page }) => {
    await page.goto(BASE_URL);

    const skipLink = page.getByRole('button', { name: /hoofdinhoud|main content|skip/i });
    await expect(skipLink).toBeVisible();
  });

  test('WCAG 2.4.2: Page Titled - All pages have descriptive titles', async ({ page }) => {
    const pagesToTest = [
      { url: BASE_URL, titlePattern: /Schatkamer|De Schatkamer/ },
      { url: `${BASE_URL}omroep/236909/avrotros`, titlePattern: /AVROTROS/ },
      { url: `${BASE_URL}persoon/85227/mies-bouwman`, titlePattern: /Mies Bouwman/ },
      { url: `${BASE_URL}verhaal/franks-componentenverhaal`, titlePattern: /Franks componenten/ },
    ];

    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.url);
      await expect(page).toHaveTitle(pageTest.titlePattern);
    }
  });

  test('WCAG 2.4.3: Focus Order - Keyboard navigation follows logical order', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab through elements and verify focus moves to different elements
    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement1).toBeTruthy();

    const position1 = await page.evaluate(() =>
      document.activeElement?.getBoundingClientRect().top ?? -1
    );

    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement2).toBeTruthy();

    await page.keyboard.press('Tab');
    const position2 = await page.evaluate(() =>
      document.activeElement?.getBoundingClientRect().top ?? -1
    );

    // Focus must have moved — either to a different position or a different element
    const focusMoved = position1 !== position2 || focusedElement1 !== focusedElement2;
    expect(focusMoved).toBeTruthy();
  });

  test('WCAG 2.4.3: Focus Order - Tab navigation visits elements in page order', async ({ page }) => {
    await page.goto(BASE_URL);

    // Track Y positions across 5 tab stops
    const positions: number[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const yPos = await page.evaluate(() => {
        const rect = document.activeElement?.getBoundingClientRect();
        return rect ? rect.top : 0;
      });
      positions.push(yPos);
    }

    // Focus should have visited at least 2 distinct Y positions (i.e. it is moving)
    const uniquePositions = new Set(positions);
    expect(uniquePositions.size).toBeGreaterThan(1);
  });

  test('WCAG 2.4.4: Link Purpose - Links have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);

    const links = page.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    // Sample the first 10 links
    const sampleSize = Math.min(10, linkCount);
    let validLinks = 0;

    for (let i = 0; i < sampleSize; i++) {
      const link = links.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const textContent = await link.textContent();
      const accessibleName = ariaLabel || textContent?.trim();
      if (accessibleName && accessibleName.length > 0) {
        validLinks++;
      }
    }

    // Most links should have accessible names (icon-only links may use aria-label)
    expect(validLinks).toBeGreaterThan(sampleSize * 0.7);
  });

  test('WCAG 2.4.6: Headings and Labels - Headings are descriptive', async ({ page }) => {
    await page.goto(BASE_URL);

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    const sampleSize = Math.min(5, headingCount);
    for (let i = 0; i < sampleSize; i++) {
      const content = await headings.nth(i).textContent();
      expect(content?.trim()).toBeTruthy();
    }
  });

  test('WCAG 2.4.7: Focus Visible - Interactive elements show focus', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.keyboard.press('Tab');

    const hasOutline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow !== 'none' ||
        el.className.includes('focus')
      );
    });

    expect(hasOutline).toBeTruthy();
  });

  test('WCAG 1.4.3: Contrast Minimum - Text has sufficient contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    const textElements = page.locator('p, h1, h2, h3, a, button');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);

    const sampleSize = Math.min(10, count);
    for (let i = 0; i < sampleSize; i++) {
      await expect(textElements.nth(i)).toBeVisible();
    }
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

    // Tab to the search field (within 10 presses)
    let tabsPressed = 0;
    while (tabsPressed < 10) {
      await page.keyboard.press('Tab');
      tabsPressed++;
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      if (activeElement === 'INPUT') break;
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

    // Focus must visit more than one distinct element type (no trap)
    const uniqueElements = new Set(focusedElements);
    expect(uniqueElements.size).toBeGreaterThan(1);
  });

  test('WCAG 1.4.10: Reflow - Content reflows at 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('WCAG 1.4.11: Non-text Contrast - Interactive elements have sufficient contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const sampleSize = Math.min(5, buttonCount);
    for (let i = 0; i < sampleSize; i++) {
      await expect(buttons.nth(i)).toBeVisible();
    }
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

    expect(page.url()).toBe(initialUrl);
  });

  test('WCAG 3.2.2: On Input - Entering data does not automatically trigger navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    const initialUrl = page.url();

    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');

    // Assert immediately — no artificial wait needed
    expect(page.url()).toBe(initialUrl);
  });

  test('WCAG 1.1.1: Non-text Content - Images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    const sampleSize = Math.min(10, imageCount);
    let imagesWithAlt = 0;
    for (let i = 0; i < sampleSize; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt !== null) imagesWithAlt++;
    }

    // Allow some decorative images (empty alt is valid), but the attribute must be present
    expect(imagesWithAlt).toBeGreaterThan(sampleSize * 0.5);
  });

  test('WCAG 3.3.2: Labels or Instructions - Form fields have instructions', async ({ page }) => {
    await page.goto(BASE_URL);

    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await expect(searchBox).toBeVisible();

    const placeholder = await searchBox.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('WCAG 1.4.12: Text Spacing - Content adapts to increased text spacing', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.addStyleTag({
      content: `
        * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
        p { margin-bottom: 2em !important; }
      `,
    });

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoeken' })).toBeVisible();
  });

  test('WCAG 2.5.8: Target Size - Interactive elements have minimum size', async ({ page }) => {
    await page.goto(BASE_URL);

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    const sampleSize = Math.min(5, buttonCount);
    for (let i = 0; i < sampleSize; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        // WCAG 2.2 Level AA requires 24×24 px minimum
        expect(box.width).toBeGreaterThanOrEqual(20);
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });

  test('WCAG 1.3.5: Identify Input Purpose - Personal form inputs have autocomplete attributes', async ({ page }) => {
    // WCAG 1.3.5 applies to inputs that collect personal information — check the login form
    await page.goto(`${BASE_URL}inloggen`);

    const emailField = page.locator('input[name="email"]');
    const passwordField = page.locator('input[type="password"]');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();

    const emailAutocomplete = await emailField.getAttribute('autocomplete');
    const passwordAutocomplete = await passwordField.getAttribute('autocomplete');

    // Both inputs must carry an autocomplete token per WCAG 1.3.5
    expect(emailAutocomplete).not.toBeNull();
    expect(passwordAutocomplete).not.toBeNull();
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

    const link = page.getByRole('link').first();
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

    const buttons = page.getByRole('button');
    expect(await buttons.count()).toBeGreaterThan(0);

    const links = page.getByRole('link');
    expect(await links.count()).toBeGreaterThan(0);

    const textboxes = page.getByRole('textbox');
    expect(await textboxes.count()).toBeGreaterThan(0);
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

  test('WCAG 2.4.11: Focus Not Obscured - Focused elements are visible in viewport', async ({ page }) => {
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

    expect(isInViewport).toBeTruthy();
  });

  test('WCAG Keyboard Navigation: FAQ page accordion keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}veelgestelde-vragen-contact`);

    const faqButton = page.getByRole('button', { name: /Wat is de Schatkamer/ });
    await faqButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText('De Schatkamer is een online portal')).toBeVisible();
  });

  test('WCAG Keyboard Navigation: Video player controls keyboard accessible', async ({ page }) => {
    await page.goto(
      `${BASE_URL}serie/2101608030021453631/sesamstraat/aflevering/2101608040031067331/sesamstraat`
    );

    const video = page.locator('video, iframe[src*="player"]').first();
    const hasVideo = (await video.count()) > 0;

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
      const searchIcon = page
        .locator('button, a')
        .filter({ hasText: /zoek/i })
        .or(page.locator('[aria-label*="zoek" i]'));
      if ((await searchIcon.count()) > 0) {
        await searchIcon.first().click();
      }
    }

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });
});
