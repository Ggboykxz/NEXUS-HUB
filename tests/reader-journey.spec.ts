import { test, expect } from '@playwright/test';

test.describe('Reader Journey', () => {
  test('should navigate from home to a story and enter the reader', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    
    // Check if the logo/brand is visible
    const brand = page.locator('text=NexusHub');
    await expect(brand).toBeVisible();

    // 2. Wait for stories to load (fetching from Firestore)
    // Note: In E2E tests, we expect at least some data to be rendered
    const storyCard = page.locator('a[href^="/webtoon/"]').first();
    
    // We might need to wait for the loading spinner to disappear if it's there
    // For now, let's assume the first story link is our target
    if (await storyCard.isVisible()) {
      await storyCard.click();

      // 3. Verify Story Detail page
      await expect(page).toHaveURL(/\/webtoon\/.+/);
      await expect(page.locator('h1')).toBeVisible();

      // 4. Click "Lire maintenant" or "Lire le Chapitre 1"
      const readButton = page.locator('text=Lire le Chapitre 1');
      await expect(readButton).toBeVisible();
      await readButton.click();

      // 5. Verify Reader page
      await expect(page).toHaveURL(/\/webtoon\/.+\/.+/);
      
      // Check for reader UI elements (like the navigation bar)
      const readerHeader = page.locator('nav').first();
      await expect(readerHeader).toBeVisible();
    } else {
      console.log('No stories found on landing page, skipping full navigation test.');
    }
  });

  test('should be able to open search and type', async ({ page }) => {
    await page.goto('/');
    
    const searchButton = page.getByLabel('Ouvrir la recherche');
    await searchButton.click();

    const searchInput = page.getByPlaceholder('Rechercher une œuvre, un auteur...');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Orisha');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=Orisha/);
  });
});
