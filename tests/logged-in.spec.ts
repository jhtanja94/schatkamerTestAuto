import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, AccountPage } from '../pages';
import { goToAccountPage, randomValidBirthYear, tooYoungBirthYear } from '../helpers/logged-in';

const username = process.env.LOGIN_USERNAME;
const password = process.env.LOGIN_PASSWORD;
const hasCredentials = Boolean(username && password);

test.describe('Logged-in user', () => {
  // Reuse the auth state saved by global-setup.ts — avoids a full login on every test.
  // If credentials are not set, global-setup writes an empty auth.json and the tests skip below.
  test.use({ storageState: 'auth.json' });

  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials, 'Set LOGIN_USERNAME and LOGIN_PASSWORD in .env to run logged-in tests');
    await page.goto(BASE_URL);
  });

  test('Account page: can open account and see password and year of birth', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await goToAccountPage(page, accountPage);

    await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });

    await expect(
      accountPage.passwordSection.or(accountPage.editPasswordTrigger).first()
    ).toBeVisible({ timeout: 5000 });
    await expect(accountPage.yearOfBirthSection).toBeVisible({ timeout: 5000 });
  });

  test('Inloggen: logout succeeds', async ({ page }) => {
    const logoutButton = page
      .getByRole('button', { name: /Uitloggen|Log uit/i })
      .or(page.getByRole('link', { name: /Uitloggen|Log uit/i }))
      .first();
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();
    await expect(page).toHaveURL(/\/inloggen|\/$/, { timeout: 10000 });
  });

  test('Account page: Lijsten tab is present and can be opened', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await goToAccountPage(page, accountPage);

    await expect(accountPage.tabLijsten).toBeVisible({ timeout: 5000 });
    await accountPage.tabLijsten.click();

    await expect(
      accountPage.lijstenHeading.or(accountPage.createListButton).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Account page: can change birth year to valid random year (16+, max 150 years ago)', async ({
    page,
  }) => {
    const accountPage = new AccountPage(page);
    await goToAccountPage(page, accountPage);

    await accountPage.editYearOfBirthTrigger.click();
    await expect(accountPage.yearOfBirthInput).toBeVisible({ timeout: 5000 });

    const birthYear = randomValidBirthYear();
    await accountPage.setBirthYear(birthYear);
    await accountPage.saveBirthYearButton.click();

    await expect(accountPage.yearOfBirthSection).toBeVisible();
  });

  test('Account page: birth year too young shows validation error', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await goToAccountPage(page, accountPage);

    await accountPage.editYearOfBirthTrigger.click();
    await expect(accountPage.yearOfBirthInput).toBeVisible({ timeout: 5000 });

    const birthYear = tooYoungBirthYear();
    await accountPage.setBirthYear(birthYear);
    await accountPage.saveBirthYearButton.click();

    await expect(accountPage.birthYearValidationError).toBeVisible({ timeout: 5000 });
  });

  test('Home page: 3-dots menu shows Toevoegen aan lijst and can open it', async ({ page }) => {
    await page.goto(BASE_URL);

    const homePage = new HomePage(page);
    const card = homePage.programCard("'t Beste beentje voor!");
    await expect(card).toBeVisible({ timeout: 8000 });

    const optionsButton = homePage.cardOptionsButton(card);
    await expect(optionsButton).toBeVisible();
    await optionsButton.click();

    await expect(optionsButton).toHaveAttribute('aria-expanded', 'true');

    await expect(homePage.addToListMenuItemLoggedIn.first()).toBeVisible({ timeout: 5000 });
    await expect(homePage.shareMenuItem.first()).toBeVisible();
  });

  test('Home page: can open Toevoegen aan lijst and see list options', async ({ page }) => {
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
    await expect(
      page.getByRole('button', { name: 'Toevoegen aan nieuwe lijst' })
    ).toBeVisible();
  });
});
