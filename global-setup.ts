import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { BASE_URL } from './config/env';

const AUTH_FILE = 'auth.json';
const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

/**
 * Global setup: runs once before all tests.
 *
 * If LOGIN_USERNAME and LOGIN_PASSWORD are set, performs a real login and saves
 * the browser storage state to auth.json. Tests in logged-in.spec.ts then reuse
 * that state instead of logging in on every test.
 *
 * If credentials are not set, an empty auth.json is written so tests that reference
 * the file can still load; those tests skip themselves via test.skip(!hasCredentials).
 */
export default async function globalSetup() {
  const username = process.env.LOGIN_USERNAME;
  const password = process.env.LOGIN_PASSWORD;

  if (!username || !password) {
    writeFileSync(AUTH_FILE, EMPTY_STATE);
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}inloggen`);

  // Dismiss cookie banner if it appears before we can interact with the form
  const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
  if (await cookieDialog.isVisible().catch(() => false)) {
    await cookieDialog
      .getByRole('button', { name: /Cookies weigeren|Weigeren/i })
      .click();
  }

  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page
    .locator('button[type="submit"]')
    .or(page.getByRole('button', { name: /inloggen/i }))
    .first()
    .click();

  await page.waitForURL(/(?!.*\/inloggen)/, { timeout: 15000 });
  await context.storageState({ path: AUTH_FILE });
  await browser.close();
}
