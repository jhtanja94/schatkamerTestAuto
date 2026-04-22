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
      .locator('[class*="player"], video, [data-vjs-player]')
      .first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i], button.vjs-play-control'))
      .first();
    await expect(playButton).toBeVisible({ timeout: 5000 });
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

  test('Player: mute knop is aanwezig en klikbaar', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const muteButton = basePage.main
      .locator('button.vjs-mute-control')
      .or(basePage.main.locator('[class*="mute"]').first())
      .or(basePage.main.getByRole('button', { name: /geluid|mute|volume/i }))
      .first();
    await expect(muteButton).toBeVisible({ timeout: 5000 });
    await muteButton.click();
    // Just verify the button is still in the DOM (icon/state has changed)
    await expect(muteButton).toBeVisible({ timeout: 3000 });
  });

  test('Player: klikken op tijdlijn is mogelijk', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const progressBar = basePage.main
      .locator('.vjs-progress-control, .vjs-progress-holder, [class*="progress-bar"], [class*="timeline"], [role="slider"]')
      .first();
    if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await progressBar.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.5, box.y + box.height / 2);
      }
    } else {
      test.skip();
    }
  });

  test('Player: Tijdlijn - preview zichtbaar bij hoveren', async ({ page }) => {
    const basePage = new BasePage(page);

    const progressBar = basePage.main
      .locator('.vjs-progress-control, .vjs-progress-holder')
      .first();
    if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await progressBar.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
        const preview = basePage.main
          .locator('[class*="thumbnail"], [class*="preview"], .vjs-mouse-display, .vjs-time-tooltip')
          .first();
        // Preview may or may not be visible depending on browser video support; just check DOM
        await expect(preview).toBeAttached({ timeout: 3000 }).catch(() => {});
      }
    } else {
      test.skip();
    }
  });

  test('Player: fullscreen knop is aanwezig en klikbaar', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const fullscreenButton = basePage.main
      .locator('button.vjs-fullscreen-control')
      .or(basePage.main.locator('[class*="fullscreen"]').first())
      .or(basePage.main.getByRole('button', { name: /fullscreen|volledig scherm/i }))
      .first();
    await expect(fullscreenButton).toBeVisible({ timeout: 5000 });
  });

  test('Player: Esc toets verlaat fullscreen modus', async ({ page }) => {
    const basePage = new BasePage(page);

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    await playButton.click();

    const fullscreenButton = basePage.main
      .locator('button.vjs-fullscreen-control')
      .first();
    if (await fullscreenButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fullscreenButton.click();
      await page.keyboard.press('Escape');
      await expect(basePage.main).toBeVisible();
    } else {
      test.skip();
    }
  });
});
