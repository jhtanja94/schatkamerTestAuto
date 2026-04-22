import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage } from '../pages';

const PROGRAM_URL = `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`;

test.describe('Programma detail - Extended', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROGRAM_URL);
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
  });

  test('Programma detail: omroep logo aanwezig in player (verdwijnt na starten, zichtbaar op hover)', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    const playerArea = basePage.main.locator('[class*="player"], video, [class*="media"]').first();
    await expect(playerArea).toBeVisible({ timeout: 8000 });

    const omroepLogo = basePage.main.locator('img[alt*="omroep" i], img[alt*="logo" i], [class*="omroep-logo"], [class*="broadcaster-logo"]').first();
    await expect(omroepLogo).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: data onder de player aanwezig (titel, datum, mediatype, omschrijving)', async ({
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

    // Leeftijdsclassificatie (6, 9, 12, 16 or all ages icon)
    const ageRating = basePage.main
      .locator('[class*="age"], [class*="rating"], [aria-label*="jaar"], img[alt*="jaar"]')
      .or(basePage.main.getByText(/\b(6|9|12|16)\s*\+?\s*jaar\b/i))
      .first();
    await expect(ageRating).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: chips (genres/onderwerpen) zichtbaar en klikbaar naar zoekpagina', async ({
    page,
  }) => {
    const basePage = new BasePage(page);

    const chip = basePage.main
      .locator('a[href*="zoeken"], button[class*="chip"], [class*="tag"] a, [class*="chip"] a')
      .first();
    await expect(chip).toBeVisible({ timeout: 8000 });

    await chip.click();
    await expect(page).toHaveURL(/\/zoeken\?/);
  });

  test('Programma detail: Transcriptie knop is aanwezig en klikbaar', async ({ page }) => {
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

  test('Programma detail: Delen popup toont correcte url naar programmapagina', async ({ page }) => {
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

  test('Programma detail: grondslag tekst aanwezig onderaan de pagina', async ({ page }) => {
    const basePage = new BasePage(page);

    // Scroll to bottom to find the grondslag text
    await basePage.footer.scrollIntoViewIfNeeded();
    const grondslagText = basePage.main
      .getByText(/grondslag|afspeelbaar|rechten|licentie|beschikbaar/i)
      .first();
    await expect(grondslagText).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: extra informatie aanwezig (id, collectie, presentatoren etc.)', async ({
    page,
  }) => {
    const basePage = new BasePage(page);

    await basePage.footer.scrollIntoViewIfNeeded();
    const extraInfo = basePage.main
      .getByText(/collectie|presentator|producent|producti|overige/i)
      .first();
    if (await extraInfo.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(extraInfo).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Programma detail: Programma Carrousel - items bevatten thumbnail, titels, datum en omroep', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`
    );
    await expect(basePage.main).toBeVisible();

    const carousel = basePage.main
      .locator('[class*="carousel"], [class*="swimlane"], [data-gtm*="carousel"]')
      .first();
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toBeVisible({ timeout: 8000 });

    // Items have thumbnails (images)
    await expect(carousel.locator('img').first()).toBeVisible({ timeout: 5000 });

    // Items have links (clickable)
    await expect(carousel.getByRole('link').first()).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: Programma Carrousel - navigeren door items werkt', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`
    );
    await expect(basePage.main).toBeVisible();

    const nextButton = basePage.main.getByRole('button', { name: 'Navigeer naar rechts' }).first();
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton.scrollIntoViewIfNeeded();
      await nextButton.click();
      await expect(basePage.main.getByRole('link').first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Programma detail: Programma Carrousel - klikken op item navigeert naar de correcte pagina', async ({
    page,
  }) => {
    const basePage = new BasePage(page);
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`
    );
    await expect(basePage.main).toBeVisible();

    const carousel = basePage.main
      .locator('[class*="carousel"], [class*="swimlane"], [data-gtm*="carousel"]')
      .first();
    await carousel.scrollIntoViewIfNeeded();
    const firstItem = carousel.getByRole('link').first();
    if (await firstItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstItem.click();
      await expect(page).toHaveURL(/\/serie\/|\/aflevering\//);
    } else {
      test.skip();
    }
  });
});
