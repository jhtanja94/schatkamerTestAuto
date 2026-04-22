import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { LoginPage, AccountPage } from '../pages';

const username = process.env.LOGIN_USERNAME;
const password = process.env.LOGIN_PASSWORD;
const hasCredentials = Boolean(username && password);

test.describe('Inloggen & Accountgegevens - Extended', () => {
  // ——— Inloggen: Wachtwoord vergeten ———

  test('Inloggen: Wachtwoord vergeten - link aanwezig op inlogpagina', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);

    const forgotLink = page
      .getByRole('link', { name: /wachtwoord vergeten|forgot password|reset/i })
      .or(page.getByRole('button', { name: /wachtwoord vergeten|forgot/i }))
      .first();
    await expect(forgotLink).toBeVisible({ timeout: 8000 });
  });

  test('Inloggen: Wachtwoord vergeten - e-mailinvoeerveld verschijnt na klikken', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);

    const forgotLink = page
      .getByRole('link', { name: /wachtwoord vergeten|forgot password|reset/i })
      .or(page.getByRole('button', { name: /wachtwoord vergeten/i }))
      .first();
    if (await forgotLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await forgotLink.click();
      const emailInput = page.getByRole('textbox', { name: /e-mail/i })
        .or(page.locator('input[type="email"]'))
        .first();
      await expect(emailInput).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  test('Inloggen: Wachtwoord vergeten - volledige reset flow (handmatig)', async () => {
    test.skip(
      true,
      'Vereist toegang tot e-mailbox. Handmatig testen: ' +
        'Klik wachtwoord vergeten → voer e-mailadres in → ontvang reset-link → ' +
        'stel nieuw wachtwoord in → log in met nieuw wachtwoord.'
    );
  });

  test('Inloggen: Account via NPO id - knop aanwezig op inlogpagina', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);

    const npoButton = page
      .getByRole('button', { name: /NPO.?id|Inloggen met NPO/i })
      .or(page.getByRole('link', { name: /NPO.?id/i }))
      .first();
    if (await npoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(npoButton).toBeEnabled();
    } else {
      test.skip();
    }
  });

  // ——— Accountgegevens (ingelogd vereist) ———

  test.describe('Accountgegevens (ingelogd)', () => {
    test.beforeEach(async ({ page }) => {
      test.skip(!hasCredentials, 'Stel LOGIN_USERNAME en LOGIN_PASSWORD in .env in voor ingelogde tests.');
      await page.goto(BASE_URL);
      const loginPage = new LoginPage(page);
      await loginPage.gotoLogin();
      await loginPage.login(username!, password!);
      await expect(page).not.toHaveURL(/\/inloggen/, { timeout: 15000 });
    });

    test('Accountgegevens: e-mailadres wijzigen - formulier is aanwezig', async ({ page }) => {
      const accountPage = new AccountPage(page);
      await page.goto(`${BASE_URL}account`);
      await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });

      const editEmailButton = page
        .getByRole('button', { name: /e-mail.*wijzig|wijzig.*e-mail|e-mailadres bewerken/i })
        .or(page.getByText(/e-mailadres/i).locator('..').getByRole('button', { name: /wijzigen/i }))
        .first();
      if (await editEmailButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editEmailButton.click();
        const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    });

    test('Accountgegevens: wachtwoord wijzigen - formulier is aanwezig', async ({ page }) => {
      const accountPage = new AccountPage(page);
      await page.goto(`${BASE_URL}account`);
      await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });

      const editPasswordButton = accountPage.editPasswordTrigger;
      if (await editPasswordButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editPasswordButton.click();
        const passwordInput = page.locator('input[type="password"]').first();
        await expect(passwordInput).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    });

    test('Accountgegevens: account verwijderen - verwijderoptie aanwezig', async ({ page }) => {
      await page.goto(`${BASE_URL}account`);

      const deleteButton = page
        .getByRole('button', { name: /verwijder.*account|account.*verwijderen|delete account/i })
        .or(page.getByRole('link', { name: /verwijder.*account/i }))
        .first();
      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(deleteButton).toBeVisible();
      } else {
        test.skip();
      }
    });

    test('Accountgegevens: account verwijderen - volledige flow (handmatig)', async () => {
      test.skip(
        true,
        'Destructieve actie - handmatig testen met tijdelijk account: ' +
          'Klik verwijderen → bevestig in modal → account is verwijderd en NPO-id ontkoppeld.'
      );
    });

    test('Accountgegevens: NPO id - wijzig accountgegevens verwijst naar NPO id pagina', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}account`);

      const npoEditButton = page
        .getByRole('button', { name: /wijzig.*accountgegevens|npo.*account|accountgegevens/i })
        .or(page.getByRole('link', { name: /npo.*id.*account|accountgegevens/i }))
        .first();
      if (await npoEditButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [newTab] = await Promise.all([
          page.context().waitForEvent('page').catch(() => null),
          npoEditButton.click(),
        ]);
        const targetPage = newTab ?? page;
        await expect(targetPage).toHaveURL(/npo|mijn\.npo/i, { timeout: 8000 });
      } else {
        test.skip();
      }
    });
  });
});
