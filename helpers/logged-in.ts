import type { Page } from '@playwright/test';
import { expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import type { AccountPage } from '../pages';

/** Navigate to account page (after login). */
export async function goToAccountPage(page: Page, accountPage: AccountPage): Promise<void> {
  const accountLinkVisible = await accountPage.accountLink.isVisible().catch(() => false);
  if (accountLinkVisible) {
    await accountPage.accountLink.click();
  } else {
    await accountPage.gotoMijnAccount(BASE_URL);
    if (!(await page.url().includes('mijn-account'))) {
      await accountPage.gotoAccount(BASE_URL);
    }
  }
  await expect(page).toHaveURL(/\/(account|mijn-account|profiel)/, { timeout: 5000 });
}

/** Valid birth year: user is at least 16 and year is not older than 150 years ago. */
export function randomValidBirthYear(): number {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 150;
  const maxYear = currentYear - 16;
  return minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
}

/** Birth year that makes user under 16 (too young). */
export function tooYoungBirthYear(): number {
  const currentYear = new Date().getFullYear();
  return currentYear - 10; // 10 years old
}
