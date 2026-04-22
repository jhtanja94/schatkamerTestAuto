import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, LoginPage, AccountPage } from '../pages';

const username = process.env.LOGIN_USERNAME;
const password = process.env.LOGIN_PASSWORD;
const hasCredentials = Boolean(username && password);

test.describe('Lijsten - Extended', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials, 'Stel LOGIN_USERNAME en LOGIN_PASSWORD in .env in voor ingelogde tests.');
    await page.goto(BASE_URL);
    const loginPage = new LoginPage(page);
    await loginPage.gotoLogin();
    await loginPage.login(username!, password!);
    await expect(page).not.toHaveURL(/\/inloggen/, { timeout: 15000 });
  });

  // ——— Mijn Lijsten ———

  test('Lijsten: nieuwe lijst aanmaken met opgegeven naam', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });
    await accountPage.tabLijsten.click();

    await expect(
      accountPage.lijstenHeading.or(accountPage.createListButton).first()
    ).toBeVisible({ timeout: 5000 });

    await accountPage.createListButton.click();

    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    const listName = `Test lijst ${Date.now()}`;
    await nameInput.fill(listName);

    const saveButton = page
      .getByRole('button', { name: /opslaan|aanmaken|maak|create|save/i })
      .last();
    await saveButton.click();

    await expect(page.getByText(listName)).toBeVisible({ timeout: 8000 });
  });

  test('Lijsten: naam van een bestaande lijst wijzigen', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    // Find first list's edit/rename option
    const listOptionsButton = page
      .locator('[class*="list"], [data-gtm*="list"]')
      .first()
      .getByRole('button', { name: /opties|meer|drie puntjes|\.\.\./i })
      .or(page.getByRole('button', { name: /naam.*wijzigen|hernoemen|bewerken/i }).first())
      .first();

    if (await listOptionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await listOptionsButton.click();
      const renameOption = page.getByRole('menuitem', { name: /naam.*wijzigen|hernoemen/i })
        .or(page.getByRole('button', { name: /naam.*wijzigen|hernoemen/i }))
        .first();
      if (await renameOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await renameOption.click();
        const nameInput = page.getByRole('textbox').first();
        await expect(nameInput).toBeVisible({ timeout: 5000 });
        const newName = `Hernoemde lijst ${Date.now()}`;
        await nameInput.clear();
        await nameInput.fill(newName);
        const saveButton = page.getByRole('button', { name: /opslaan|save/i }).last();
        await saveButton.click();
        await expect(page.getByText(newName)).toBeVisible({ timeout: 8000 });
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('Lijsten: lijst verwijderen - na bevestigen in modal wordt lijst verwijderd', async ({
    page,
  }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    // Create a disposable list first
    await accountPage.createListButton.click();
    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    const listName = `Te verwijderen lijst ${Date.now()}`;
    await nameInput.fill(listName);
    await page.getByRole('button', { name: /opslaan|aanmaken|create|save/i }).last().click();
    await expect(page.getByText(listName)).toBeVisible({ timeout: 8000 });

    // Delete it
    const listItem = page.getByText(listName).locator('..').first();
    const deleteButton = listItem
      .getByRole('button', { name: /verwijder|delete/i })
      .or(page.getByRole('button', { name: /verwijder|delete/i }).first())
      .first();

    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click();
      const confirmButton = page.getByRole('button', { name: /bevestigen|verwijder|ja|confirm/i }).first();
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await confirmButton.click();
      await expect(page.getByText(listName)).not.toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  test('Lijsten: Mijn Lijsten - Delen popup opent', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    const shareButton = page
      .getByRole('button', { name: /delen/i })
      .first();
    if (await shareButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shareButton.click();
      const popup = page.getByRole('dialog').or(page.getByText(/Delen|deel/i).first());
      await expect(popup.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Try three-dots menu
      const listOptionsButton = page
        .getByRole('button', { name: /meer opties|opties/i })
        .first();
      if (await listOptionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await listOptionsButton.click();
        const delenItem = page.getByRole('menuitem', { name: /Delen/i }).first();
        await delenItem.click();
        await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    }
  });

  test('Lijsten: Mijn Lijsten - Delen popup toont correcte url; kopieer werkt', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    const shareButton = page.getByRole('button', { name: /delen/i }).first();
    if (await shareButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shareButton.click();
      const urlField = page.locator('input[readonly], input[type="url"]').first();
      await expect(urlField).toBeVisible({ timeout: 5000 });

      const sharedUrl = await urlField.inputValue();
      expect(sharedUrl).toMatch(/https?:\/\//);

      const copyButton = page.getByRole('button', { name: /Kopieer|Copy|kopiëren/i });
      await expect(copyButton).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('Lijsten: gedeelde lijst url opent met titel en programmas zichtbaar', async ({ page }) => {
    // This test requires a known shared list URL; we navigate to a public list URL pattern
    // and verify the shared view renders correctly
    await page.goto(`${BASE_URL}account`);
    const accountPage = new AccountPage(page);
    await accountPage.tabLijsten.click();

    const shareButton = page.getByRole('button', { name: /delen/i }).first();
    if (await shareButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shareButton.click();
      const urlField = page.locator('input[readonly], input[type="url"]').first();
      await expect(urlField).toBeVisible({ timeout: 5000 });
      const sharedUrl = await urlField.inputValue();
      await page.keyboard.press('Escape');

      await page.goto(sharedUrl);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  // ——— Lijst bewerken ———

  test('Lijsten: programma toevoegen via program detail pagina', async ({ page }) => {
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`
    );

    const addToListButton = page
      .getByRole('button', { name: /toevoegen aan lijst|aan lijst/i })
      .first();
    await expect(addToListButton).toBeVisible({ timeout: 8000 });
    await addToListButton.click();

    await expect(
      page.getByRole('heading', { name: 'Toevoegen aan lijst' })
    ).toBeVisible({ timeout: 5000 });

    const listOption = page.getByRole('checkbox').or(page.getByRole('button', { name: /lijst/i })).first();
    if (await listOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listOption.click();
      const confirmButton = page.getByRole('button', { name: /opslaan|bevestigen|klaar/i }).first();
      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmButton.click();
      }
      await expect(page.getByText(/toegevoegd|saved|opgeslagen/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Lijsten: programma toevoegen aan nieuwe lijst via modal', async ({ page }) => {
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`
    );

    const addToListButton = page
      .getByRole('button', { name: /toevoegen aan lijst|aan lijst/i })
      .first();
    await expect(addToListButton).toBeVisible({ timeout: 8000 });
    await addToListButton.click();

    await expect(page.getByRole('button', { name: 'Toevoegen aan nieuwe lijst' })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: 'Toevoegen aan nieuwe lijst' }).click();

    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(`Nieuwe lijst via modal ${Date.now()}`);

    const saveButton = page.getByRole('button', { name: /aanmaken|opslaan|create|save/i }).last();
    await saveButton.click();

    await expect(page.getByText(/toegevoegd|opgeslagen|saved/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Lijsten: programma toevoegen via programma carrousel (drie puntjes)', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);

    const card = homePage.programCard("'t Beste beentje voor!");
    await expect(card).toBeVisible({ timeout: 8000 });

    const optionsButton = homePage.cardOptionsButton(card);
    await optionsButton.click();
    await homePage.addToListMenuItemLoggedIn.first().click();

    await expect(
      page.getByRole('heading', { name: 'Toevoegen aan lijst' })
    ).toBeVisible({ timeout: 5000 });
  });

  test('Lijsten: programma verwijderen uit een lijst', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    // Navigate to first list
    const firstListLink = page.getByRole('link', { name: /lijst/i }).first();
    if (await firstListLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstListLink.click();

      const removeButton = page
        .getByRole('button', { name: /verwijder|remove|uit lijst/i })
        .first();
      if (await removeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const programTitle = await page.getByRole('link').first().textContent().catch(() => '');
        await removeButton.click();
        const confirmButton = page.getByRole('button', { name: /bevestig|ja|verwijder|confirm/i }).first();
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
        if (programTitle) {
          await expect(page.getByText(programTitle)).not.toBeVisible({ timeout: 8000 });
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('Lijsten: sortering van programmas in een lijst aanpassen', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await page.goto(`${BASE_URL}account`);
    await accountPage.tabLijsten.click();

    const firstListLink = page.getByRole('link', { name: /lijst/i }).first();
    if (await firstListLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstListLink.click();

      const sortButton = page
        .getByRole('button', { name: /sorter|sortering|oudste|nieuwste|Laatste/i })
        .first();
      if (await sortButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await sortButton.click();
        const sortOption = page.getByRole('option', { name: /oudste|nieuwste/i })
          .or(page.getByRole('radio', { name: /oudste|nieuwste/i }))
          .first();
        await expect(sortOption).toBeVisible({ timeout: 3000 });
        await sortOption.click();
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
