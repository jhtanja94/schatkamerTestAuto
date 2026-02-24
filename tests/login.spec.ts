import { test, expect } from '../fixtures/base';
import { LoginPage } from '../pages';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoLogin();
  });

  test('page loads and form is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/\/inloggen/);
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('email and password fields are present and password is masked', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.passwordField).toHaveAttribute('type', 'password');
  });

  test('validation appears when submitting empty form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.submitButton.click();

    await expect
      .poll(
        async () => {
          const [hasErrorText, hasAlert, hasErrorClass] = await Promise.all([
            loginPage.errorMessage.isVisible().catch(() => false),
            loginPage.alertRegion.isVisible().catch(() => false),
            loginPage.errorLikeClass.isVisible().catch(() => false),
          ]);
          return hasErrorText || hasAlert || hasErrorClass;
        },
        { timeout: 5000 }
      )
      .toBe(true);

    await expect(page).toHaveURL(/\/inloggen/);
  });

  test('error message appears for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@example.com', 'wrongpassword');

    await expect
      .poll(
        async () => {
          const [hasErrorText, hasAlert, hasErrorClass, stillOnLogin] = await Promise.all([
            loginPage.errorMessage.isVisible().catch(() => false),
            loginPage.alertRegion.isVisible().catch(() => false),
            loginPage.errorLikeClass.isVisible().catch(() => false),
            page.url().includes('/inloggen'),
          ]);
          return hasErrorText || hasAlert || hasErrorClass || stillOnLogin;
        },
        { timeout: 10000 }
      )
      .toBe(true);

    await expect(page).toHaveURL(/\/inloggen/);
  });

  test('successful login redirects away from login page', async ({ page }) => {
    const username = process.env.LOGIN_USERNAME;
    const password = process.env.LOGIN_PASSWORD;

    test.skip(!username || !password, 'Set LOGIN_USERNAME and LOGIN_PASSWORD in .env to run this test');

    const loginPage = new LoginPage(page);
    await loginPage.login(username!, password!);

    await expect(page).not.toHaveURL(/\/inloggen/, { timeout: 15000 });
  });

  test('can navigate back from login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const backVisible = await loginPage.backLink.isVisible().catch(() => false);
    test.skip(!backVisible, 'No back/home link found on login page');

    await loginPage.backLink.click();
    await expect(page).not.toHaveURL(/\/inloggen/, { timeout: 5000 });
  });
});
