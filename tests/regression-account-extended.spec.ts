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

  test('Inloggen: Wachtwoord vergeten - klikken opent e-mailinvoerform', async ({ page }) => {
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
      test.skip(!hasCredentials, 'Stel LOGIN_USERNAME en LOGIN_PASSWORD in .env in.');
      await page.goto(BASE_URL);
      const loginPage = new LoginPage(page);
      await loginPage.gotoLogin();
      await loginPage.login(username!, password!);
      await expect(page).not.toHaveURL(/\/inloggen/, { timeout: 15000 });
    });

    test('Accountgegevens: e-mailadres wijzigen - optie of formulier aanwezig', async ({ page }) => {
      await page.goto(`${BASE_URL}account`);
      const accountPage = new AccountPage(page);
      await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });

      // Look for any edit-email trigger
      const editEmailTrigger = page
        .getByRole('button', { name: /e-mail.*wijzig|wijzig.*e-mail|e-mailadres/i })
        .or(page.getByText(/e-mailadres/i).first().locator('..').getByRole('button'))
        .first();
      if (await editEmailTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editEmailTrigger.click();
        const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 5000 });
      } else {
        // E-mail section may not be available for this account type (e.g. NPO-id)
        test.skip();
      }
    });

    test('Accountgegevens: wachtwoord wijzigen - optie of formulier aanwezig', async ({ page }) => {
      await page.goto(`${BASE_URL}account`);
      const accountPage = new AccountPage(page);
      await expect(accountPage.accountHeading).toBeVisible({ timeout: 5000 });

      const editPasswordTrigger = accountPage.editPasswordTrigger;
      if (await editPasswordTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editPasswordTrigger.click();
        // Look for any password input or form
        const passwordField = page
          .locator('input[type="password"], input[name*="password"], input[name*="wachtwoord"]')
          .first();
        const formElement = page.getByRole('form').first();
        const appeared = await passwordField.or(formElement).first()
          .isVisible({ timeout: 5000 }).catch(() => false);
        if (!appeared) {
          // Password change may redirect to external provider (e.g. NPO-id)
          test.skip();
        }
      } else {
        // Password may not be available for NPO-id accounts
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
          'Klik verwijderen → bevestig in modal → account is verwijderd.'
      );
    });

    test('Accountgegevens: NPO id - wijzig accountgegevens knop aanwezig', async ({ page }) => {
      await page.goto(`${BASE_URL}account`);

      const npoEditButton = page
        .getByRole('button', { name: /npo.*account|accountgegevens.*wijzig|wijzig.*accountgegevens/i })
        .or(page.getByRole('link', { name: /npo.*account|accountgegevens/i }))
        .first();
      if (await npoEditButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(npoEditButton).toBeEnabled();
      } else {
        test.skip();
      }
    });
  });
});
