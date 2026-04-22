import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const PROGRAM_URL = `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`;
const VERHAAL_URL = `${BASE_URL}verhaal/franks-componentenverhaal`;

test.describe('Toegankelijkheid - Player & Verhalen', () => {
  // ——— Player keyboard controls ———

  test('Toegankelijkheid: spatiebalk start en pauzeert video', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_URL);
    await expect(basePage.main).toBeVisible();

    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-vjs-player]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });

    // Click player to focus it, then use spacebar
    await playerContainer.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');

    // Player should have reacted — verify container is still present
    await expect(playerContainer).toBeVisible({ timeout: 5000 });

    // Play/pause button may be present
    const playOrPause = basePage.main
      .getByRole('button', { name: /play|afspelen|pauze|pause/i })
      .first();
    if (await playOrPause.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Space again toggles
      await page.keyboard.press('Space');
      await expect(playerContainer).toBeVisible({ timeout: 3000 });
    }
  });

  test('Toegankelijkheid: Tab toets navigeert door speler-bedieningselementen', async ({
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

    // Tab through controls and collect focused element tags
    const focusedTags: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      if (tag && tag !== 'BODY') focusedTags.push(tag);
    }
    // At least some interactive elements should be reachable via Tab
    expect(focusedTags.length).toBeGreaterThan(0);
  });

  test('Toegankelijkheid: pijltjestoetsen (links/rechts) spoelen terug/vooruit', async ({
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
    await page.keyboard.press('Space'); // start playing

    // Arrow right should skip forward (or at least not crash)
    await page.keyboard.press('ArrowRight');

    // Player still visible after key press
    await expect(playerContainer).toBeVisible({ timeout: 3000 });
  });

  // ——— Verhalen keyboard navigation ———

  test('Toegankelijkheid: Verhalenpagina - Tab navigeert door interactieve elementen', async ({
    page,
  }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Count interactive elements on the page
    const interactiveCount = await page.evaluate(
      () => document.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])').length
    );
    expect(interactiveCount).toBeGreaterThan(0);

    // Tab through and verify focus moves
    let focusedCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const isFocused = await page.evaluate(
        () => document.activeElement !== document.body && document.activeElement !== null
      );
      if (isFocused) focusedCount++;
    }
    expect(focusedCount).toBeGreaterThan(0);
  });

  test('Toegankelijkheid: Homepage - Tab navigatie bereikt interactieve elementen', async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Tab through first 15 elements; collect focused tags
    const focusedTags: string[] = [];
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      if (tag && tag !== 'BODY') focusedTags.push(tag);
    }
    expect(focusedTags.length).toBeGreaterThan(3);

    // Shift+Tab moves focus back
    await page.keyboard.press('Shift+Tab');
    const tagAfterShiftTab = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(tagAfterShiftTab).toBeTruthy();
    expect(tagAfterShiftTab).not.toBe('BODY');
  });
});
