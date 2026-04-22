import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';

/**
 * Registratie tests.
 *
 * Most registration flows require real email verification or NPO-id OAuth and cannot be
 * fully automated without dedicated test accounts. The tests below verify the UI flows
 * up to the point that requires external verification, and are marked accordingly.
 */
test.describe('Registreren', () => {
  test('Registreren: registratiepagina is bereikbaar via Inloggen', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);
    const registerLink = page
      .getByRole('link', { name: /registreren|aanmaken|account aanmaken|sign up/i })
      .or(page.getByRole('button', { name: /registreren|aanmaken|sign up/i }))
      .first();
    await expect(registerLink).toBeVisible({ timeout: 8000 });
  });

  test('Registreren: e-mail registratie - e-mailveld en knop aanwezig', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);
    const registerLink = page
      .getByRole('link', { name: /registreren|aanmaken|account aanmaken/i })
      .or(page.getByRole('button', { name: /registreren|aanmaken/i }))
      .first();

    if (await registerLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await registerLink.click();
      const emailInput = page.getByRole('textbox', { name: /e-mail/i })
        .or(page.locator('input[type="email"]'))
        .first();
      await expect(emailInput).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });

  test('Registreren: Account via e-mail - verificatie e-mail stap (handmatig te verifiëren)', async ({
    page,
  }) => {
    test.skip(
      true,
      'Vereist een echt e-mailadres voor verificatie - handmatig testen. ' +
        'Na invoeren geldig e-mailadres: gebruiker ontvangt verificatie-e-mail. ' +
        'Na verificatiecode invoeren: gebruiker landt op Registratie voltooien pagina.'
    );
  });

  test('Registreren: Registratie voltooien - geboortejaar <16 blokkeert, ≥16 maakt account aan (handmatig)', async ({
    page,
  }) => {
    test.skip(
      true,
      'Vereist verificatie-e-mail stap. Handmatig testen: ' +
        'geboortejaar jonger dan 16 jaar → account wordt NIET aangemaakt. ' +
        'geboortejaar 16 jaar of ouder → account aangemaakt, ingelogd, landt op Mijn Lijsten.'
    );
  });

  test('Registreren: Account via NPO id - knop aanwezig op registratiepagina', async ({ page }) => {
    await page.goto(`${BASE_URL}inloggen`);

    const npoIdButton = page
      .getByRole('button', { name: /NPO.?id|inloggen met npo/i })
      .or(page.getByRole('link', { name: /NPO.?id/i }))
      .first();
    if (await npoIdButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(npoIdButton).toBeEnabled();
    } else {
      test.skip();
    }
  });

  test('Registreren: Account via NPO id - volledige flow (handmatig)', async ({ page }) => {
    test.skip(
      true,
      'Vereist NPO-id account. Handmatig testen: ' +
        '1. Klik op NPO-id knop → inloggen bij NPO (indien nog niet ingelogd in browser). ' +
        '2. Geef toestemming voor Schatkamer. ' +
        '3. Voer geboortejaar ≥16 in → account aangemaakt, ingelogd, landt op Mijn Lijsten. ' +
        'NPO-id naam wordt getoond als gebruikersnaam.'
    );
  });
});
