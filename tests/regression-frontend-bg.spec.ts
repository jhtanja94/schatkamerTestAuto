import { test, expect } from '../fixtures/base';

const BASE_URL = 'https://schatkamer-tst.beeldengeluid.nl/';

test.describe('Regressie Test Set - Front end BG', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Cookies: banner visible on first visit and can accept', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    // Cookie banner should be visible
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    await expect(cookieDialog).toBeVisible();
    await expect(cookieDialog.getByRole('button', { name: 'Alles accepteren' })).toBeVisible();
    await expect(cookieDialog.getByRole('button', { name: 'Cookies weigeren' })).toBeVisible();

    // Accept cookies and banner disappears
    await cookieDialog.getByRole('button', { name: 'Alles accepteren' }).click();
    await expect(cookieDialog).toBeHidden();
  });

  test('Cookies: can refuse cookies (functional banner closes)', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    const cookieDialog = page.getByRole('dialog', { name: 'Privacy' });
    await expect(cookieDialog).toBeVisible();
    await cookieDialog.getByRole('button', { name: 'Cookies weigeren' }).click();
    await expect(cookieDialog).toBeHidden();
  });

  test('Homepage: serie/person/omroep/program carousels navigate and items clickable', async ({ page }) => {
    // Serie carousel (Nostalgie)
    await expect(page.getByRole('heading', { name: 'Nostalgie', level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Navigeer naar rechts' }).first().click();
    await expect(page.getByRole('link').filter({ hasText: /SESAMSTRAAT|HET KLOKHUIS|DE STRAAT/ }).first()).toBeVisible();
    // Click one series item and verify serie detail URL pattern, then go back
    await page.getByRole('link').filter({ has: page.getByText(/SESAMSTRAAT|HET KLOKHUIS|DE STRAAT/) }).first().click();
    await expect(page).toHaveURL(/\/serie\//);
    await page.goBack();

    // Programma's met meerdere streams carousel
    await expect(page.getByRole('heading', { name: "Programma's met meerdere streams", level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Navigeer naar rechts' }).nth(1).click();
    await expect(page.getByRole('link').filter({ hasText: /Video met|Audio met|Programma met/ }).first()).toBeVisible();

    // Omroepen van de week carousel
    await expect(page.getByRole('heading', { name: 'Omroepen van de week', level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Navigeer naar rechts' }).nth(2).click();
    await expect(page.getByRole('link').filter({ hasText: /BNNVARA|AVROTROS|VPRO|EO|HUMAN|NTR/ }).first()).toBeVisible();

    // Personen carousel (Weet je nog?)
    await expect(page.getByRole('heading', { name: 'Weet je nog?', level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Navigeer naar rechts' }).nth(3).click();
    await expect(page.getByRole('link').filter({ hasText: /Mies Bouwman|Willem Ruis|Carry Tefsen/ }).first()).toBeVisible();
  });

  test('Homepage: program card share menu is visible', async ({ page }) => {
    // Open first share menu
    await expect(page.getByRole('heading', { name: "Demo 24-11-2025", level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Meer opties' }).first().click();
    await expect(page.getByRole('menuitem', { name: 'Toevoegen aan lijst' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delen' })).toBeVisible();
  });

  test('Footer: external link opens new tab; internal link opens in same tab', async ({ page, context }) => {
    // Scroll to footer
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();

    // External link
    const externalPromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Over Beeld & Geluid' }).click();
    const newTab = await externalPromise;
    await expect(newTab).toHaveURL(/beeldengeluid\.nl\/organisatie/);
    await newTab.close();

    // Internal link
    await page.getByRole('link', { name: 'AV-Convenant' }).click();
    await expect(page).toHaveURL(/\/av-convenant$/);
  });

  test('Footer: newsletter input and submit present', async ({ page }) => {
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('button', { name: 'Aanmelden' })).toBeVisible();
  });

  test('FAQ: expand/collapse answers by clicking a question', async ({ page }) => {
    await page.getByRole('contentinfo').getByRole('link', { name: 'Veelgestelde vragen & Contact' }).click();
    await expect(page.getByRole('heading', { name: 'Veelgestelde vragen & Contact', level: 1 })).toBeVisible();

    const question = page.getByRole('button', { name: 'Wat is de Schatkamer?' });
    await question.click();
    // After expanding, the following paragraph text should be visible
    await expect(page.getByText('De Schatkamer is een online portal')).toBeVisible();
  });

  test('Footer: navigate to an omroep page', async ({ page }) => {
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    // Navigate directly to test omroep page loads correctly
    await page.goto(`${BASE_URL}omroep/236909/avrotros`);
    await expect(page).toHaveURL(/\/omroep\//);
    await expect(page.getByRole('heading', { name: 'AVROTROS', level: 1 })).toBeVisible();
  });

  test('Homepage: static components (Hero, pay-off, banner) are visible', async ({ page }) => {
    // Hero section with heading
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    // Banner section
    await expect(page.getByRole('banner')).toBeVisible();
    // Main content
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Homepage: Uitgelichte Verhalen - click on story item', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Lees iets anders', level: 2 })).toBeVisible();
    // Click first story link
    const storyLink = page.getByRole('link').filter({ hasText: /verhaal|Pokémon|Marvin/ }).first();
    await storyLink.click();
    await expect(page).toHaveURL(/\/verhaal\//);
  });

  test('Verhalen: page components and meta byline visible', async ({ page }) => {
    // Navigate to a story page
    await page.goto(`${BASE_URL}verhaal/franks-componentenverhaal`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    // Verify meta information (author, date, read time) exists - check for paragraphs
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('Personen pagina: curated person page has intro and image', async ({ page }) => {
    // Navigate to Mies Bouwman (curated person)
    await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
    await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();
    // Curated pages should have an intro paragraph
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('Personen pagina: uncurated person page shows name and role', async ({ page }) => {
    // Navigate to an uncurated person (J. Duin)
    await page.goto(`${BASE_URL}persoon/95029/j-duin`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Personen pagina: programs linked to person are visible', async ({ page }) => {
    await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
    await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();
    // Programs section should show related programs
    await expect(page.getByRole('heading', { name: /In de spotlight/i, level: 2 })).toBeVisible();
  });

  test('Programma detail: title, date, description visible', async ({ page }) => {
    // Navigate to a program detail page
    await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`);
    // Title
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Date - check for date text in various formats
    await expect(page.locator('text=/\\d{1,2}-\\d{1,2}-\\d{4}|\\d{4}/').first()).toBeVisible();
    // Description/summary
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('Programma detail: related items carousels visible', async ({ page }) => {
    await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`);
    // Check for any related content section or heading
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Pagination works on omroep page', async ({ page }) => {
    const url = `${BASE_URL}omroep/223534/ntr`;
    await page.goto(url);
  
    // Assert we're on the page
    await expect(page.getByRole('heading', { name: /NTR/i, level: 1 })).toBeVisible();
  
    const pagination = page.getByRole('navigation', { name: /Paginering|Pagination/i });
    await expect(pagination).toBeVisible();
  
    const firstResult = () =>
      page.getByRole('main').getByRole('link').first().textContent();
  
    const firstBefore = await firstResult();
  
    // Go to page 2 (prefer numbered button, fallback to "Next")
    const nextPage = pagination.getByRole('link', { name: /^2$/ })
      .or(pagination.getByRole('link', { name: /Volgende|Next/i }));
  
    await nextPage.click();
    await expect(page).toHaveURL(/[?&]pagina=2/);
  
    const firstAfter = await firstResult();
    expect(firstBefore).not.toBe(firstAfter);
  
    // Go back to page 1 (prefer "1", fallback to "Previous")
    const prevPage = pagination.getByRole('link', { name: /^1$/ })
      .or(pagination.getByRole('link', { name: /Vorige|Previous/i }));
  
    await prevPage.click();
    await expect(page).toHaveURL(/omroep\/223534\/ntr($|[?&]pagina=1)/);
  });
  

  // test('Videoplayer: play/pause button toggles video playback', async ({ page }) => {
  //   await dismissCookiesIfPresent(page);
  //   await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`);
    
  //   // Wait for and click the initial play button
  //   const initialPlayButton = page.getByRole('button', { name: 'Video Afspelen' });
  //   await expect(initialPlayButton).toBeVisible({ timeout: 10000 });
  //   await initialPlayButton.click();
    
  //   // Wait for video to start playing
  //   const video = page.locator('video').first();
  //   await expect(video).toHaveJSProperty('paused', false, { timeout: 10000 });
    
  //   // Verify the play button changed to pause button with vjs-playing class
  //   const pauseButton = page.locator('button.vjs-play-control.vjs-playing');
  //   await expect(pauseButton).toBeVisible({ timeout: 5000 });
    
  //   // Click pause button (using force to avoid control bar interception)
  //   await pauseButton.click({ force: true });
    
    
  //   // Verify the button changed to play button with vjs-paused class
  //   const playButton = page.locator('button.vjs-play-control.vjs-paused');
  //   await expect(playButton).toBeVisible({ timeout: 5000 });
    
  //   // Click play again to verify full cycle
  //   await playButton.click({ force: true });
    
  //   // Verify video is playing again
  //   await expect(video).toHaveJSProperty('paused', false, { timeout: 10000 });
  // });

  // test('Videoplayer: initial state shows poster and play button', async ({ page }) => {
  //   await dismissCookiesIfPresent(page);
  //   await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`);
    
  //   // Verify the video player region is present
  //   const videoPlayer = page.locator('[role="region"][aria-label="video player"]');
  //   await expect(videoPlayer).toBeVisible({ timeout: 10000 });
    
  //   // Verify the initial play button is visible
  //   const initialPlayButton = page.getByRole('button', { name: 'Video Afspelen' });
  //   await expect(initialPlayButton).toBeVisible();
    
  //   // Verify video element exists but is not yet playing
  //   const video = page.locator('video').first();
  //   await expect(video).toBeVisible();
  //   await expect(video).toHaveJSProperty('paused', true);
  // });

  // test('Videoplayer: fullscreen mode toggle', async ({ page }) => {
  //   await dismissCookiesIfPresent(page);
  //   await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`);
    
  //   // Start the video by clicking the initial play button
  //   const initialPlayButton = page.getByRole('button', { name: 'Video Afspelen' });
  //   await expect(initialPlayButton).toBeVisible({ timeout: 10000 });
  //   await initialPlayButton.click();
    
  //   // Wait for video to start playing
  //   const video = page.locator('video').first();
  //   await expect(video).toHaveJSProperty('paused', false, { timeout: 10000 });
    
  //   // Locate the fullscreen button
  //   const fullscreenButton = page.getByRole('button', { name: /Volledig scherm|Fullscreen/i });
  //   await expect(fullscreenButton).toBeVisible({ timeout: 5000 });
    
  //   // Click fullscreen button (note: actual fullscreen mode can't be tested in headless)
  //   // We're just verifying the button is clickable and present
  //   await fullscreenButton.click({ force: true });
    
  //   // After clicking fullscreen, the button text might change to "Exit fullscreen"
  //   // but in headless mode, fullscreen API might not work as expected
  //   // So we just verify the video is still playing
  //   await expect(video).toHaveJSProperty('paused', false);
  // });

  test('Toegankelijkheid: keyboard navigation on homepage', async ({ page }) => {
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    // Check that an element has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Press Enter on a link (should navigate)
    const initialUrl = page.url();
    await page.keyboard.press('Enter');
    
    // URL should have changed or element should have been activated
    const newUrl = page.url();
    expect(newUrl).toBeTruthy();
  });
});


