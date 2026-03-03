# Page objects

Page objects encapsulate selectors and actions for specific pages or flows. Use them in specs to keep tests readable and to centralize UI changes.

## Structure

- **BasePage** – Shared layout: `banner`, `main`, `footer`, cookie dialog (`cookieDialog`, `acceptCookies`, `refuseCookies`), `homeLink`, `goto()`, `scrollFooterIntoView()`.
- **HomePage** – Homepage: `searchBox`, `zoekenButton`, `mainHeading`, `contentLinksWithImage`, carousel buttons, program card “Meer opties”, footer sections and links, `search()`, `searchAndSubmit()`, `openFirstProgramCardOptions()`.
- **SearchPage** – Search flyout and `/zoeken` results: `flyoutMediaHeading`, `flyoutMediaItems`, `flyoutOmroepLinks`, `resultsHeading`, `sortTrigger`, `playableSwitch`, `pagination`, `filterButton(name)`.
- **LoginPage** – `/inloggen`: `emailField`, `passwordField`, `submitButton`, `login(email, password)`, `gotoLogin()`.
- **AccountPage** – Account (when logged in): `accountHeading`, `accountLink`, `tabLijsten`, `passwordSection`, `editPasswordTrigger`, `yearOfBirthSection`, `editYearOfBirthTrigger`, `lijstenHeading`, `createListButton`, `gotoAccount()`, `gotoMijnAccount()`.

## Usage

```ts
import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, LoginPage } from '../pages';

test('homepage search', async ({ page }) => {
  await page.goto(BASE_URL);
  const home = new HomePage(page);
  await home.search('NTR');
  await expect(home.searchBox).toHaveValue('NTR');
});

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.gotoLogin(); // uses baseURL from config
  await loginPage.login(process.env.LOGIN_USERNAME!, process.env.LOGIN_PASSWORD!);
  await expect(page).not.toHaveURL(/inloggen/);
});
```

## Adding a new page

1. Add `pages/MyPage.ts` extending `BasePage` (or not if it’s a fragment).
2. Expose locators as getters and actions as methods.
3. Export from `pages/index.ts`.
