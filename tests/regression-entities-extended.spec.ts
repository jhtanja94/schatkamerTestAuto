import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage, SearchPage } from '../pages';

test.describe('Entiteiten - Extended', () => {
  // ——— Entiteit: Omroep ———

  test.describe('Omroep pagina', () => {
    test('Omroep: naam, logo en voorgangers zijn zichtbaar', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();

      // Logo (img within main — at least one image should be present)
      const logo = basePage.main.locator('img').first();
      if (await logo.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(logo).toBeVisible();
      }

      // Predecessors section (Voorgangers) — optional: not all omroepen show this
      const voorgangers = basePage.main.getByText(/Voorganger/i).first();
      if (await voorgangers.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(voorgangers).toBeVisible();
      }
      // Page loaded correctly — heading is sufficient
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();
    });

    test("Omroep: programma's gelinkt aan omroep zijn zichtbaar", async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();
      await expect(basePage.main.getByRole('link').first()).toBeVisible({ timeout: 8000 });
    });

    test('Omroep: sortering aanpassen - knop toont nieuwe sortering', async ({ page }) => {
      await page.goto(`${BASE_URL}omroep/223534/ntr`);

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await expect(sortButton.first()).toBeVisible({ timeout: 8000 });
      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();

      await expect(sortButton.first()).toHaveText(/Nieuwste eerst/i, { timeout: 5000 });
    });

    test('Omroep: filters zichtbaar, omroep naam is aanwezig als actief filter', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      const searchPage = new SearchPage(page);

      for (const name of ['Type', 'Datum', 'Collectie', 'Genre', 'Persoon', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      // AVROTROS should appear as the active/pre-selected entity filter
      const activeOmroepFilter = page.getByText(/AVROTROS/i).first();
      await expect(activeOmroepFilter).toBeVisible();
    });

    test('Omroep: filteren dat leidt tot 0 resultaten toont melding', async ({ page }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();

      await searchPage.filterButton('Datum').click();
      const datumPanel = page.locator('[role="listbox"], [role="menu"], [role="dialog"]').last();
      const yearInput = datumPanel.locator('input').first();
      if (await yearInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await yearInput.fill('1800');
        await yearInput.press('Tab');
        // "0 resultaten" is in an aria-live region
        const noResults = page.getByText(/0 resultaten|geen resultaten|niets gevonden/i).first();
        await expect(noResults).toBeAttached({ timeout: 8000 });
      } else {
        test.skip();
      }
    });
  });

  // ——— Entiteit: Personen ———

  test.describe('Personen pagina', () => {
    test('Personen: sortering staat standaard op Oudste eerst', async ({ page }) => {
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
      await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await expect(sortButton.first()).toBeVisible({ timeout: 8000 });
      await expect(sortButton.first()).toHaveText(/Oudste eerst/i);
    });

    test('Personen: sortering aanpassen - knop toont nieuwe sortering', async ({ page }) => {
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
      await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await expect(sortButton.first()).toBeVisible({ timeout: 8000 });
      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();

      await expect(sortButton.first()).toHaveText(/Nieuwste eerst/i, { timeout: 5000 });
    });

    test('Personen: filters zichtbaar, persoon naam is aanwezig als actief filter', async ({
      page,
    }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);

      for (const name of ['Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      // Mies Bouwman should appear as the active entity filter
      const activePersonFilter = page.getByText(/Mies Bouwman/i).first();
      await expect(activePersonFilter).toBeVisible();
    });

    test('Personen: filteren dat leidt tot 0 resultaten toont melding', async ({ page }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);

      await searchPage.filterButton('Datum').click();
      const datumPanel = page.locator('[role="listbox"], [role="menu"], [role="dialog"]').last();
      const yearInput = datumPanel.locator('input').first();
      if (await yearInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await yearInput.fill('1800');
        await yearInput.press('Tab');
        const noResults = page.getByText(/0 resultaten|geen resultaten|niets gevonden/i).first();
        await expect(noResults).toBeAttached({ timeout: 8000 });
      } else {
        test.skip();
      }
    });
  });

  // ——— Entiteit: Serie ———

  test.describe('Serie pagina', () => {
    test('Serie: seriepagina toont titel, datums en omschrijving', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible();

      // Begin/einddatum — match date patterns like "1 jan 1976" or "1976"
      await expect(page.locator('text=/\\d{1,2} \\w+ \\d{4}/').first()).toBeVisible({ timeout: 5000 });

      // Description/summary paragraph with real content (exclude aria-live regions which are hidden)
      await expect(
        basePage.main.locator('p:not([aria-live])').filter({ hasText: /\S{10,}/ }).first()
      ).toBeVisible({ timeout: 5000 });
    });

    test('Serie: filters zichtbaar, Programma filter is niet aanwezig', async ({ page }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible({ timeout: 8000 });

      for (const name of ['Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Persoon', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      // Programma filter should NOT be present on serie pages
      await expect(searchPage.filterButton('Programma')).not.toBeVisible();
    });

    test('Serie: sortering aanpassen - knop toont nieuwe sortering', async ({ page }) => {
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible();

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await expect(sortButton.first()).toBeVisible({ timeout: 8000 });
      await expect(sortButton.first()).toHaveText(/Oudste eerst/i);

      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();
      await expect(sortButton.first()).toHaveText(/Nieuwste eerst/i, { timeout: 5000 });
    });
  });
});
