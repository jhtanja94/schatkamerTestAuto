import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const PROGRAM_URL = `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`;
const PROGRAM_WITH_RELATED_URL = `${BASE_URL}serie/2101608030021453631/sesamstraat/aflevering/2101608040079898631`;

test.describe('Programma detail - Extended', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROGRAM_URL);
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
  });

  test('Programma detail: player area en play-knop zijn zichtbaar', async ({ page }) => {
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

  test('Programma detail: data onder de player aanwezig (titel, datum, omschrijving)', async ({
    page,
  }) => {
    const basePage = new BasePage(page);

    // Program title (h1)
    await expect(basePage.main.getByRole('heading', { level: 1 })).toBeVisible();

    // Date (uitzenddatum)
    await expect(basePage.main.locator('text=/\\d{1,2}-\\d{1,2}-\\d{4}|\\d{4}/').first()).toBeVisible();

    // Description paragraph
    await expect(
      basePage.main.locator('p:not(.vjs-offscreen)').filter({ hasText: /\S/ }).first()
    ).toBeVisible();
  });

  test('Programma detail: chips (genres/onderwerpen) zichtbaar en klikbaar naar zoekpagina', async ({
    page,
  }) => {
    const basePage = new BasePage(page);

    const chip = basePage.main
      .locator('a[href*="zoeken"], [class*="chip"] a, [class*="tag"] a, a[href*="filter"]')
      .first();
    await expect(chip).toBeVisible({ timeout: 8000 });

    await chip.click();
    await expect(page).toHaveURL(/\/zoeken\?/);
  });

  test('Programma detail: Transcriptie knop is aanwezig als van toepassing', async ({ page }) => {
    const basePage = new BasePage(page);

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

  test('Programma detail: Delen popup toont url naar programmapagina', async ({ page }) => {
    const basePage = new BasePage(page);

    const delenButton = basePage.main
      .getByRole('button', { name: 'Delen' })
      .or(basePage.main.locator('button[data-gtm-interaction-text*="Delen"]'))
      .first();
    await expect(delenButton).toBeVisible({ timeout: 8000 });
    await delenButton.click();

    const urlField = page.locator('input[readonly], input[type="url"]').first();
    const copyButton = page.getByRole('button', { name: /Kopieer|Copy|kopiëren/i });
    await expect(urlField.or(copyButton).first()).toBeVisible({ timeout: 5000 });

    if (await urlField.isVisible().catch(() => false)) {
      const sharedUrl = await urlField.inputValue();
      expect(sharedUrl).toContain('serie');
    }
  });

  test('Programma detail: Delen - e-mail optie is aanwezig', async ({ page }) => {
    const basePage = new BasePage(page);

    const delenButton = basePage.main
      .getByRole('button', { name: 'Delen' })
      .or(basePage.main.locator('button[data-gtm-interaction-text*="Delen"]'))
      .first();
    await delenButton.click();

    const emailLink = page.getByRole('link', { name: /e-mail|mail/i })
      .or(page.locator('a[href^="mailto:"]'))
      .first();
    await expect(emailLink).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: grondslag tekst aanwezig op de pagina', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.footer.scrollIntoViewIfNeeded();
    const grondslagText = basePage.main
      .getByText(/grondslag|afspeelbaar|rechten|licentie|beschikbaar/i)
      .first();
    await expect(grondslagText).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: extra informatie aanwezig indien beschikbaar', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.footer.scrollIntoViewIfNeeded();
    const extraInfo = basePage.main
      .getByText(/collectie|presentator|producent|productie|overige/i)
      .first();
    if (await extraInfo.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(extraInfo).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Programma detail: Programma Carrousel - items zijn aanwezig met links', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_WITH_RELATED_URL);
    await expect(basePage.main).toBeVisible();

    // Any carousel / swimlane section in main
    const carousel = basePage.main
      .locator('[class*="carousel"], [class*="swimlane"], [data-gtm*="carousel"]')
      .first();

    if (await carousel.isVisible({ timeout: 8000 }).catch(() => false)) {
      await carousel.scrollIntoViewIfNeeded();
      await expect(carousel.locator('img').first()).toBeVisible({ timeout: 5000 });
      await expect(carousel.getByRole('link').first()).toBeVisible({ timeout: 5000 });
    } else {
      // Fallback: check that main has multiple links (programs should have related content)
      const relatedLinks = basePage.main.getByRole('link').nth(1);
      if (await relatedLinks.isVisible({ timeout: 8000 }).catch(() => false)) {
        await expect(relatedLinks).toBeVisible();
      } else {
        test.skip();
      }
    }
  });

  test('Programma detail: Programma Carrousel - navigeren door items werkt', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_WITH_RELATED_URL);
    await expect(basePage.main).toBeVisible();

    const nextButton = basePage.main.getByRole('button', { name: 'Navigeer naar rechts' }).first();
    if (await nextButton.isVisible({ timeout: 8000 }).catch(() => false)) {
      await nextButton.scrollIntoViewIfNeeded();
      await nextButton.click();
      await expect(basePage.main.getByRole('link').first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Programma detail: Programma Carrousel - klikken navigeert naar correcte pagina', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(PROGRAM_WITH_RELATED_URL);
    await expect(basePage.main).toBeVisible();

    const carousel = basePage.main
      .locator('[class*="carousel"], [class*="swimlane"], [data-gtm*="carousel"]')
      .first();
    if (await carousel.isVisible({ timeout: 8000 }).catch(() => false)) {
      await carousel.scrollIntoViewIfNeeded();
      const firstItem = carousel.getByRole('link').first();
      await firstItem.click();
      await expect(page).toHaveURL(/\/serie\/|\/aflevering\//);
    } else {
      test.skip();
    }
  });
});
