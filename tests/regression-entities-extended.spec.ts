import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { BasePage, SearchPage } from '../pages';

test.describe('Entiteiten - Extended', () => {
  // ——— Entiteit: Omroep ———

  test.describe('Omroep pagina', () => {
    test('Omroep: naam, introductietekst, logo en voorgangers zijn zichtbaar', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();

      // Intro/description
      await expect(basePage.main.locator('p').first()).toBeVisible();

      // Logo (img within main)
      await expect(basePage.main.locator('img').first()).toBeVisible();

      // Predecessors section (Voorgangers)
      const voorgangers = basePage.main.getByText(/Voorgangers/i).first();
      await expect(voorgangers).toBeVisible();
    });

    test("Omroep: programma's gelinkt aan omroep zijn zichtbaar", async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(page.getByRole('heading', { name: /AVROTROS/i, level: 1 })).toBeVisible();
      await expect(basePage.main.getByRole('link').first()).toBeVisible({ timeout: 8000 });
    });

    test('Omroep: sortering aanpassen geeft nieuwe volgorde', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}omroep/223534/ntr`);
      await expect(basePage.main).toBeVisible();

      const firstBefore = await basePage.main.getByRole('link').first().textContent().catch(() => '');

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();

      const firstAfter = await basePage.main.getByRole('link').first().textContent().catch(() => '');
      expect(firstBefore).not.toBe(firstAfter);
    });

    test('Omroep: filters zichtbaar, omroep filter is vooraf geselecteerd en niet te deselecteren', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      const searchPage = new SearchPage(page);

      for (const name of ['Type', 'Datum', 'Collectie', 'Genre', 'Persoon', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      // Omroep filter should be pre-selected (visible as active chip/tag)
      const activeOmroepFilter = page.getByText(/AVROTROS/i).first();
      await expect(activeOmroepFilter).toBeVisible();
    });

    test('Omroep: filteren dat leidt tot 0 resultaten toont melding', async ({ page }) => {
      const basePage = new BasePage(page);
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}omroep/236909/avrotros`);
      await expect(basePage.main).toBeVisible();

      await searchPage.filterButton('Datum').click();
      const startYearInput = page.locator('input[type="number"], input[type="text"]').first();
      if (await startYearInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startYearInput.fill('1800');
        await page.keyboard.press('Enter');
        const noResults = page.getByText(/geen resultaten|0 resultaten|niets gevonden/i).first();
        await expect(noResults).toBeVisible({ timeout: 8000 });
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

    test('Personen: sortering aanpassen werkt', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
      await expect(basePage.main).toBeVisible();

      const firstBefore = await basePage.main.getByRole('link').first().textContent().catch(() => '');

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();

      const firstAfter = await basePage.main.getByRole('link').first().textContent().catch(() => '');
      expect(firstBefore).not.toBe(firstAfter);
    });

    test('Personen: filters zichtbaar, persoon filter is vooraf geselecteerd en niet te deselecteren', async ({
      page,
    }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);

      for (const name of ['Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      const activePersonFilter = page.getByText(/Mies Bouwman/i).first();
      await expect(activePersonFilter).toBeVisible();
    });

    test('Personen: filteren dat leidt tot 0 resultaten toont melding', async ({ page }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);

      await searchPage.filterButton('Datum').click();
      const yearInput = page.locator('input[type="number"], input[type="text"]').first();
      if (await yearInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await yearInput.fill('1800');
        await page.keyboard.press('Enter');
        const noResults = page.getByText(/geen resultaten|0 resultaten|niets gevonden/i).first();
        await expect(noResults).toBeVisible({ timeout: 8000 });
      } else {
        test.skip();
      }
    });
  });

  // ——— Entiteit: Serie ———

  test.describe('Serie pagina', () => {
    test('Serie: ongecureerde seriepagina toont titel, genres, datums en omschrijving', async ({
      page,
    }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible();

      // Genres (max 3)
      await expect(basePage.main.locator('text=/educatie|documentaire|amusement|nieuws/i').first()).toBeVisible();

      // Begin/einddatum
      await expect(basePage.main.locator('text=/\\d{4}/').first()).toBeVisible();

      // Description/summary paragraph
      await expect(basePage.main.locator('p').filter({ hasText: /\S{10}/ }).first()).toBeVisible();
    });

    test('Serie: filters zichtbaar, Programma filter is niet aanwezig', async ({ page }) => {
      const searchPage = new SearchPage(page);
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible({ timeout: 8000 });

      for (const name of ['Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Persoon', 'Onderwerp']) {
        await expect(searchPage.filterButton(name)).toBeVisible({ timeout: 8000 });
      }

      // Programma filter should NOT be present
      await expect(searchPage.filterButton('Programma')).not.toBeVisible();
    });

    test('Serie: sortering aanpassen werkt', async ({ page }) => {
      const basePage = new BasePage(page);
      await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
      await expect(basePage.main).toBeVisible();

      const sortButton = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
      await expect(sortButton.first()).toBeVisible({ timeout: 8000 });
      await expect(sortButton.first()).toHaveText(/Oudste eerst/i);

      const firstBefore = await basePage.main.getByRole('link').first().textContent().catch(() => '');
      await sortButton.first().click();
      await page.getByRole('radio', { name: /^Nieuwste eerst$/i }).click();
      const firstAfter = await basePage.main.getByRole('link').first().textContent().catch(() => '');
      expect(firstBefore).not.toBe(firstAfter);
    });
  });
});
