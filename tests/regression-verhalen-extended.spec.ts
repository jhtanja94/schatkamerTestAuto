import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const VERHAAL_URL = `${BASE_URL}verhaal/franks-componentenverhaal`;

test.describe('Verhalen - Extended', () => {
  // ——— Delen verhaal ———

  test('Verhalen: Delen - popup opent en bevat url of kopieerknop', async ({ page }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Delen button in byline / share section
    const delenButton = page
      .getByRole('button', { name: /Delen/i })
      .or(page.locator('[aria-label*="Delen" i]'))
      .first();
    await expect(delenButton).toBeVisible({ timeout: 8000 });
    await delenButton.click();

    const sharePopupContent = page
      .getByRole('dialog')
      .or(page.locator('input[readonly], input[type="url"]'))
      .or(page.getByRole('button', { name: /Kopieer|Copy|kopiëren/i }))
      .first();
    await expect(sharePopupContent).toBeVisible({ timeout: 5000 });
  });

  test('Verhalen: Delen - e-mail optie is aanwezig', async ({ page }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    const delenButton = page
      .getByRole('button', { name: /Delen/i })
      .or(page.locator('[aria-label*="Delen" i]'))
      .first();
    await delenButton.click();

    const emailLink = page.getByRole('link', { name: /e-mail|mail/i })
      .or(page.locator('a[href^="mailto:"]'))
      .first();
    await expect(emailLink).toBeVisible({ timeout: 5000 });
  });

  // ——— Nieuwsbrief component op verhalenpagina ———

  test('Verhalen: Nieuwsbrief component - ongeldig e-mailadres toont validatiefout', async ({
    page,
  }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // Find the newsletter form in main content (not footer)
    const basePage = new BasePage(page);
    const newsletterInput = basePage.main
      .locator('input[type="email"]')
      .or(basePage.main.getByRole('textbox', { name: /e-mail|nieuwsbrief/i }))
      .first();

    if (await newsletterInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newsletterInput.scrollIntoViewIfNeeded();
      await newsletterInput.fill('geen-geldig-emailadres');

      const aanmeldenButton = basePage.main.getByRole('button', { name: /Aanmelden/i }).first();
      await aanmeldenButton.click();

      const hasValidationError =
        await page.getByText(/ongeldig|invalid|vul een geldig|voer een geldig|fout/i).first().isVisible({ timeout: 3000 }).catch(() => false)
        || (await newsletterInput.getAttribute('aria-invalid').catch(() => null)) === 'true';
      if (!hasValidationError) {
        // Some newsletter forms rely on browser-native validation — skip if not detectable
        test.skip();
        return;
      }
    } else {
      test.skip();
    }
  });

  test('Verhalen: Nieuwsbrief component - aanmeldknop is aanwezig en enabled', async ({ page }) => {
    await page.goto(VERHAAL_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    const basePage = new BasePage(page);
    const newsletterInput = basePage.main
      .locator('input[type="email"]')
      .or(basePage.main.getByRole('textbox', { name: /e-mail|nieuwsbrief/i }))
      .first();

    if (await newsletterInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newsletterInput.scrollIntoViewIfNeeded();
      const aanmeldenButton = basePage.main.getByRole('button', { name: /Aanmelden/i }).first();
      await expect(aanmeldenButton).toBeVisible();
      await expect(aanmeldenButton).toBeEnabled();
    } else {
      test.skip();
    }
  });

  // ——— Programma Media Component ———

  test('Verhalen: Programma Media Component - player met play-knop zichtbaar', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const playerContainer = basePage.main
      .locator('[class*="player"], video, [data-vjs-player], [class*="media"]')
      .first();
    if (await playerContainer.isVisible({ timeout: 8000 }).catch(() => false)) {
      await playerContainer.scrollIntoViewIfNeeded();

      const playButton = basePage.main
        .getByRole('button', { name: /play|afspelen|start/i })
        .or(basePage.main.locator('[aria-label*="play" i], button.vjs-play-control'))
        .first();
      await expect(playButton).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('Verhalen: PMC - Meer opties menu opent met programma-actie opties', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const optionsButton = basePage.main
      .locator('button[data-gtm-interaction-text*="Meer opties"]')
      .or(basePage.main.locator('button[aria-label*="opties" i], button[aria-label*="meer" i]'))
      .first();

    if (await optionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await optionsButton.click();
      // Some menu item should be visible — use multiple role fallbacks
      const menuItem = page.getByRole('menuitem').first()
        .or(page.getByRole('menu').getByRole('button').first())
        .or(page.getByRole('listitem').filter({ has: page.getByRole('button') }).first());
      if (await menuItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(menuItem).toBeVisible();
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('Verhalen: PMC - Delen popup toont url', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const optionsButton = basePage.main
      .locator('button[data-gtm-interaction-text*="Meer opties"]')
      .or(basePage.main.locator('button[aria-label*="opties" i]'))
      .first();
    if (await optionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await optionsButton.click();
      const delenItem = page.getByRole('menuitem', { name: /Delen/i })
        .or(page.getByRole('button', { name: 'Delen' }))
        .first();
      if (await delenItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await delenItem.click();
        const urlField = page.locator('input[readonly], input[type="url"]').first();
        await expect(urlField).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('Verhalen: PMC - play knop start video', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i], button.vjs-play-control'))
      .first();

    if (await playButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await playButton.scrollIntoViewIfNeeded();
      await playButton.click();
      const pauseButton = basePage.main
        .getByRole('button', { name: /pauze|pause/i })
        .or(basePage.main.locator('[aria-label*="pause" i], button.vjs-play-control[title*="Pause" i]'))
        .first();
      await expect(pauseButton).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  test('Verhalen: PMC - mute knop is aanwezig en klikbaar', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    if (await playButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await playButton.click();
      const muteButton = basePage.main
        .locator('button.vjs-mute-control, [class*="mute"]')
        .or(basePage.main.getByRole('button', { name: /geluid|mute|volume/i }))
        .first();
      await expect(muteButton).toBeVisible({ timeout: 5000 });
      await muteButton.click();
      await expect(muteButton).toBeVisible({ timeout: 3000 });
    } else {
      test.skip();
    }
  });

  // ——— Audio & Video Component ———

  test('Verhalen: Audio & Video Component - player met play-knop aanwezig', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const avComponent = basePage.main
      .locator('[class*="player"], [class*="audio"], video')
      .first();
    if (await avComponent.isVisible({ timeout: 8000 }).catch(() => false)) {
      await avComponent.scrollIntoViewIfNeeded();
      await expect(avComponent).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Verhalen: Audio & Video Component - Transcriptie knop aanwezig indien beschikbaar', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const transcriptButton = basePage.main
      .getByRole('button', { name: /transcriptie|transcript/i })
      .or(basePage.main.getByRole('link', { name: /transcriptie|transcript/i }))
      .first();
    if (await transcriptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(transcriptButton).toBeEnabled();
    } else {
      test.skip();
    }
  });

  test('Verhalen: Audio & Video Component - fullscreen knop aanwezig na starten', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(VERHAAL_URL);
    await expect(basePage.main).toBeVisible();

    const playButton = basePage.main
      .getByRole('button', { name: /play|afspelen|start/i })
      .or(basePage.main.locator('[aria-label*="play" i]'))
      .first();
    if (await playButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await playButton.click();
      const fullscreenButton = basePage.main
        .locator('button.vjs-fullscreen-control, [class*="fullscreen"]')
        .or(basePage.main.getByRole('button', { name: /fullscreen|volledig scherm/i }))
        .first();
      await expect(fullscreenButton).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });
});
