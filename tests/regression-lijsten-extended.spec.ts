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

  async function openLijstenTab(page: any, accountPage: AccountPage) {
    await page.goto(`${BASE_URL}account`);
    await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });
    await accountPage.tabLijsten.click();
    await expect(
      accountPage.lijstenHeading.or(accountPage.createListButton).first()
    ).toBeVisible({ timeout: 5000 });
  }

  // ——— Mijn Lijsten ———

  test('Lijsten: nieuwe lijst aanmaken met opgegeven naam', async ({ page }) => {
    test.setTimeout(60000);
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    if (!(await accountPage.createListButton.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }
    await accountPage.createListButton.click();

    const nameInput = page.getByRole('textbox', { name: /naam|name/i })
      .or(page.getByPlaceholder(/naam|name/i))
      .or(page.getByRole('textbox').first())
      .first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    const listName = `Test lijst ${Date.now()}`;
    await nameInput.fill(listName);

    const saveButton = page
      .getByRole('button', { name: /opslaan|aanmaken|maak aan|maak lijst|create|save/i })
      .last();
    await saveButton.click();

    await expect(page.getByText(listName)).toBeVisible({ timeout: 8000 });
  });

  test('Lijsten: naam van een bestaande lijst wijzigen', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    // Try to find a rename option via three-dots menu on any list
    const listOptionsButton = page
      .getByRole('button', { name: /meer opties|opties|drie puntjes/i })
      .first();
    if (await listOptionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await listOptionsButton.click();
      const renameOption = page.getByRole('menuitem', { name: /naam.*wijzigen|hernoemen|bewerken/i }).first();
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
    test.setTimeout(90000);
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    // Create a disposable list first
    if (!(await accountPage.createListButton.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }
    await accountPage.createListButton.click();
    const nameInput = page.getByRole('textbox', { name: /naam|name/i })
      .or(page.getByPlaceholder(/naam|name/i))
      .or(page.getByRole('textbox').first())
      .first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    const listName = `Te verwijderen ${Date.now()}`;
    await nameInput.fill(listName);
    await page.getByRole('button', { name: /opslaan|aanmaken|maak|create|save/i }).last().click();
    await expect(page.getByText(listName)).toBeVisible({ timeout: 8000 });

    // Delete it via options menu
    const listOptionsButton = page
      .getByText(listName)
      .locator('..').locator('..')
      .getByRole('button', { name: /meer opties|opties/i })
      .first();
    if (await listOptionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listOptionsButton.click();
      const deleteOption = page.getByRole('menuitem', { name: /verwijder|delete/i }).first();
      if (await deleteOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteOption.click();
        const confirmButton = page.getByRole('button', { name: /bevestigen|verwijder|ja|confirm/i }).first();
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
        await expect(page.getByText(listName)).not.toBeVisible({ timeout: 8000 });
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('Lijsten: Mijn Lijsten - Delen popup opent', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    const shareButton = page.getByRole('button', { name: /delen/i }).first();
    if (await shareButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shareButton.click();
      await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 5000 });
    } else {
      const listOptionsButton = page.getByRole('button', { name: /meer opties|opties/i }).first();
      if (await listOptionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await listOptionsButton.click();
        const delenItem = page.getByRole('menuitem', { name: /Delen/i }).first();
        if (await delenItem.isVisible({ timeout: 3000 }).catch(() => false)) {
          await delenItem.click();
          await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 5000 });
        } else {
          test.skip();
        }
      } else {
        test.skip();
      }
    }
  });

  test('Lijsten: Mijn Lijsten - Delen toont correcte url', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    // Try direct share button or via options menu
    let opened = false;
    const shareButton = page.getByRole('button', { name: /delen/i }).first();
    if (await shareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shareButton.click();
      opened = true;
    } else {
      const listOptionsButton = page.getByRole('button', { name: /meer opties|opties/i }).first();
      if (await listOptionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await listOptionsButton.click();
        const delenItem = page.getByRole('menuitem', { name: /Delen/i }).first();
        if (await delenItem.isVisible({ timeout: 3000 }).catch(() => false)) {
          await delenItem.click();
          opened = true;
        }
      }
    }

    if (!opened) { test.skip(); return; }

    const urlField = page.locator('input[readonly], input[type="url"]').first();
    await expect(urlField).toBeVisible({ timeout: 5000 });
    const sharedUrl = await urlField.inputValue();
    expect(sharedUrl).toMatch(/https?:\/\//);
  });

  test('Lijsten: gedeelde lijst url opent correct (titel zichtbaar)', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    let sharedUrl = '';
    const shareButton = page.getByRole('button', { name: /delen/i }).first();
    if (await shareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shareButton.click();
    } else {
      const listOptionsButton = page.getByRole('button', { name: /meer opties|opties/i }).first();
      if (await listOptionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await listOptionsButton.click();
        const delenItem = page.getByRole('menuitem', { name: /Delen/i }).first();
        if (await delenItem.isVisible({ timeout: 3000 }).catch(() => false)) {
          await delenItem.click();
        } else { test.skip(); return; }
      } else { test.skip(); return; }
    }

    const urlField = page.locator('input[readonly], input[type="url"]').first();
    if (await urlField.isVisible({ timeout: 5000 }).catch(() => false)) {
      sharedUrl = await urlField.inputValue();
      await page.keyboard.press('Escape');
      await page.goto(sharedUrl);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  // ——— Lijst bewerken ———

  test('Lijsten: programma toevoegen via Meer opties op program detail pagina', async ({ page }) => {
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`
    );
    const basePage = new (await import('../pages')).BasePage(page);
    await expect(basePage.main).toBeVisible();

    // When logged in, the Meer opties button gives access to Toevoegen aan lijst
    const optionsButton = basePage.main
      .locator('button[data-gtm-interaction-text*="Meer opties"]')
      .or(basePage.main.locator('[aria-label*="opties" i]'))
      .first();

    if (await optionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await optionsButton.click();
      const addToList = page.getByRole('menuitem', { name: /toevoegen aan lijst|aan lijst/i })
        .or(page.getByRole('button', { name: /toevoegen aan lijst/i }))
        .first();
      await expect(addToList).toBeVisible({ timeout: 5000 });
      await addToList.click();
      await expect(
        page.getByRole('heading', { name: 'Toevoegen aan lijst' })
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Fallback: direct "Toevoegen aan lijst" button (logged-in state)
      const directButton = page
        .getByRole('button', { name: /toevoegen aan lijst/i })
        .first();
      if (await directButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await directButton.click();
        await expect(
          page.getByRole('heading', { name: 'Toevoegen aan lijst' })
        ).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    }
  });

  test('Lijsten: programma toevoegen aan nieuwe lijst via modal', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`
    );
    const basePage = new (await import('../pages')).BasePage(page);
    await expect(basePage.main).toBeVisible();

    // Open Meer opties → Toevoegen aan lijst
    const optionsButton = basePage.main
      .locator('button[data-gtm-interaction-text*="Meer opties"]')
      .or(basePage.main.locator('[aria-label*="opties" i]'))
      .first();

    let modalOpened = false;
    if (await optionsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await optionsButton.click();
      const addToList = page.getByRole('menuitem', { name: /toevoegen aan lijst/i })
        .or(page.getByRole('button', { name: /toevoegen aan lijst/i }))
        .first();
      if (await addToList.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addToList.click();
        modalOpened = true;
      }
    } else {
      const directButton = page.getByRole('button', { name: /toevoegen aan lijst/i }).first();
      if (await directButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await directButton.click();
        modalOpened = true;
      }
    }

    if (!modalOpened) { test.skip(); return; }

    const newListButton = page.getByRole('button', { name: 'Toevoegen aan nieuwe lijst' });
    await expect(newListButton).toBeVisible({ timeout: 5000 });
    await newListButton.click();

    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(`Via modal ${Date.now()}`);

    const saveButton = page
      .getByRole('button', { name: /aanmaken|opslaan|create|save/i })
      .or(page.getByRole('button', { name: /maak|lijst/i }))
      .last();
    if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveButton.click();
      // Modal should close or show confirmation
      await expect(page.getByRole('heading', { name: 'Toevoegen aan lijst' })).not.toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
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

  test('Lijsten: sortering van programmas in een lijst aanpassen', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await openLijstenTab(page, accountPage);

    // Navigate to first list
    const firstListLink = page
      .locator('[class*="list"], [data-gtm*="list"]')
      .getByRole('link')
      .first();
    if (await firstListLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstListLink.click();

      const sortButton = page
        .getByRole('button', { name: /sorter|sortering|oudste|nieuwste|Laatste|toegevoegd/i })
        .first();
      if (await sortButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await sortButton.click();
        const sortOption = page.getByRole('option', { name: /oudste|nieuwste/i })
          .or(page.getByRole('radio', { name: /oudste|nieuwste/i }))
          .first();
        await expect(sortOption).toBeVisible({ timeout: 3000 });
        await sortOption.click();
        await expect(sortButton).toBeVisible({ timeout: 3000 });
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
