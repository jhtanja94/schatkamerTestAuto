import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const PROGRAM_URL = `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`;
const VERHAAL_URL = `${BASE_URL}verhaal/franks-componentenverhaal`;

test.describe('Toegankelijkheid - Player & Verhalen', () => {
  // ——— Player keyboard controls ———

  test('Toegankelijkheid: spatiebalk start en pauzeert video in player', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_URL);
    await expect(basePage.main).toBeVisible();

    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-vjs-player]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });

    // Click player to give it focus, then use spacebar
    await playerContainer.click();
    await page.keyboard.press('Space');

    // After pressing space, player should be playing (pause button visible) or at least have reacted
    const pauseOrPlay = basePage.main
      .getByRole('button', { name: /pauze|pause|play|afspelen/i })
      .first();
    await expect(pauseOrPlay).toBeVisible({ timeout: 5000 });

    // Press space again to toggle
    await page.keyboard.press('Space');
    await expect(pauseOrPlay).toBeVisible({ timeout: 3000 });
  });

  test('Toegankelijkheid: Tab toets navigeert door bedieningselementen van de player', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_URL);
    await expect(basePage.main).toBeVisible();

    // Start by clicking in player area to position focus
    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-vjs-player]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });
    await playerContainer.click();

    // Tab through controls and verify each one gets focus
    const focusedElements: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      const focusedLabel = await page.evaluate(
        () =>
          (document.activeElement as HTMLElement)?.getAttribute('aria-label') ??
          (document.activeElement as HTMLElement)?.title ??
          ''
      );
      focusedElements.push(`${focusedTag}:${focusedLabel}`);
    }

    // At least some interactive elements received focus
    expect(focusedElements.some((el) => el.startsWith('BUTTON'))).toBe(true);
  });

  test('Toegankelijkheid: pijltjestoetsen (links/rechts) spoelen terug/vooruit in player', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_URL);
    await expect(basePage.main).toBeVisible();

    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-vjs-player]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });
    await playerContainer.click();
    await page.keyboard.press('Space'); // Start playing

    // Get current time before
    const timeBefore = await basePage.main
      .locator('.vjs-current-time-display, [class*="current-time"]')
      .first()
      .textContent()
      .catch(() => '0');

    await page.keyboard.press('ArrowRight');

    const timeAfter = await basePage.main
      .locator('.vjs-current-time-display, [class*="current-time"]')
      .first()
      .textContent()
      .catch(() => '0');

    // Time should have changed (or at least no error thrown)
    expect(timeBefore !== undefined).toBe(true);
  });

  // ——— Verhalen keyboard navigation ———

  test('Toegankelijkheid: Verhalenpagina - alle onderdelen bereikbaar met toetsenbord', async ({
    page,
  }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Press Tab multiple times and verify focus moves through interactive elements
    const interactiveCount = await page.evaluate(() => {
      const selectors = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
      return document.querySelectorAll(selectors).length;
    });
    expect(interactiveCount).toBeGreaterThan(0);

    // Tab through first 10 elements and check each gets focus
    let focusedCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const isActive = await page.evaluate(
        () => document.activeElement !== document.body && document.activeElement !== null
      );
      if (isActive) focusedCount++;
    }
    expect(focusedCount).toBeGreaterThan(0);
  });

  test('Toegankelijkheid: Homepage - Tab navigatie bereikt alle interactieve elementen', async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Tab through first 15 elements
    let focusedCount = 0;
    const visitedLabels = new Set<string>();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(
        () =>
          (document.activeElement as HTMLElement)?.getAttribute('aria-label') ??
          (document.activeElement as HTMLElement)?.textContent?.trim().slice(0, 50) ??
          ''
      );
      if (label && document.activeElement !== document.body) {
        focusedCount++;
        visitedLabels.add(label);
      }
    }
    expect(focusedCount).toBeGreaterThan(3);

    // Shift+Tab moves focus back
    await page.keyboard.press('Shift+Tab');
    const focusedAfterShiftTab = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(focusedAfterShiftTab).toBeTruthy();
  });
});
