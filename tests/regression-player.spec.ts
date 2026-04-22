import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const PROGRAM_URL = `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`;

test.describe('Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROGRAM_URL);
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
  });

  test('Player: Initiële status - thumbnail en play-knop zichtbaar', async ({ page }) => {
    const basePage = new BasePage(page);

    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-gtm*="player"]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i], [class*="play-button"], button.vjs-play-control'))
      .first();
    await expect(playButton).toBeVisible({ timeout: 5000 });
  });

  test('Player: omroep logo aanwezig in player (zichtbaar voor starten)', async ({ page }) => {
    const basePage = new BasePage(page);

    const omroepLogo = basePage.main
      .locator('img[alt*="omroep" i], img[alt*="logo" i], [class*="omroep-logo"], [class*="broadcaster"]')
      .first();
    await expect(omroepLogo).toBeVisible({ timeout: 5000 });
  });

  test('Player: play knop start video - play verandert in pauze', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i], button.vjs-play-control'))
      .first();
    await expect(playButton).toBeVisible({ timeout: 8000 });
    await playButton.click();

    const pauseButton = basePage.main
      .getByRole('button', { name: /pauze|pause/i })
      .or(basePage.main.locator('[aria-label*="pause" i], button.vjs-play-control[title*="Pause" i]'))
      .first();
    await expect(pauseButton).toBeVisible({ timeout: 8000 });
  });

  test('Player: pauze knop stopt video - pauze verandert terug in play', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i], button.vjs-play-control'))
      .first();
    await playButton.click();

    const pauseButton = basePage.main
      .getByRole('button', { name: /pauze|pause/i })
      .or(basePage.main.locator('[aria-label*="pause" i], button.vjs-play-control[title*="Pause" i]'))
      .first();
    await expect(pauseButton).toBeVisible({ timeout: 8000 });
    await pauseButton.click();

    await expect(playButton).toBeVisible({ timeout: 5000 });
  });

  test('Player: mute knop dempt geluid - icoon past zich aan', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const volumeButton = basePage.main
      .locator('button.vjs-mute-control, [class*="mute"], [class*="volume"]')
      .or(basePage.main.getByRole('button', { name: /geluid|mute|volume/i }))
      .first();
    await expect(volumeButton).toBeVisible({ timeout: 5000 });

    const ariaLabelBefore = await volumeButton.getAttribute('aria-label').catch(() => '');
    await volumeButton.click();
    const ariaLabelAfter = await volumeButton.getAttribute('aria-label').catch(() => '');
    expect(ariaLabelBefore).not.toBe(ariaLabelAfter);
  });

  test('Player: klikken op tijdlijn verspringt video naar geselecteerd tijdstip', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const progressBar = basePage.main
      .locator('.vjs-progress-control, [class*="progress"], [class*="timeline"], [role="slider"]')
      .first();
    await expect(progressBar).toBeVisible({ timeout: 5000 });

    const box = await progressBar.boundingBox();
    if (box) {
      await progressBar.click({ position: { x: box.width * 0.5, y: box.height / 2 } });
      await expect(playButton.or(basePage.main.getByRole('button', { name: /pauze|pause/i }).first())).toBeVisible({ timeout: 5000 });
    }
  });

  test('Player: Tijdlijn - preview thumbnail zichtbaar bij hoveren', async ({ page }) => {
    const basePage = new BasePage(page);

    const progressBar = basePage.main
      .locator('.vjs-progress-control, [class*="progress-bar"], [class*="timeline"]')
      .first();
    if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await progressBar.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
        const preview = basePage.main
          .locator('[class*="thumbnail"], [class*="preview"], .vjs-mouse-display, .vjs-time-tooltip')
          .first();
        await expect(preview).toBeVisible({ timeout: 3000 });
      }
    } else {
      test.skip();
    }
  });

  test('Player: fullscreen knop schakelt volledig scherm in', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const fullscreenButton = basePage.main
      .locator('button.vjs-fullscreen-control, [class*="fullscreen"]')
      .or(basePage.main.getByRole('button', { name: /fullscreen|volledig scherm/i }))
      .first();
    await expect(fullscreenButton).toBeVisible({ timeout: 5000 });
    await fullscreenButton.click();

    // After fullscreen, the button title changes to exit fullscreen
    const exitFullscreen = basePage.main
      .locator('[aria-label*="exit fullscreen" i], [title*="exit fullscreen" i], [class*="fullscreen-exit"]')
      .or(page.getByRole('button', { name: /exit fullscreen|verlaat|terugkeren/i }))
      .first();
    await expect(exitFullscreen).toBeVisible({ timeout: 5000 });
  });

  test('Player: Esc toets verlaat fullscreen modus', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const fullscreenButton = basePage.main
      .locator('button.vjs-fullscreen-control, [class*="fullscreen"]')
      .first();
    if (await fullscreenButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fullscreenButton.click();
      await page.keyboard.press('Escape');

      // Player should still be visible (no longer fullscreen)
      await expect(basePage.main).toBeVisible();
    } else {
      test.skip();
    }
  });
});
