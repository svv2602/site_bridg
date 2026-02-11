import { test, expect } from '@playwright/test';

test.describe('Tyre Search', () => {
  test('search page loads', async ({ page }) => {
    await page.goto('/shyny');
    await expect(page).toHaveTitle(/[Шш]ин/);
  });

  test('tyre listing shows results', async ({ page }) => {
    await page.goto('/shyny');

    // Wait for tyre cards to load
    const tyreCards = page.locator('[data-testid="tyre-card"], .tyre-card, article');
    await expect(tyreCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('tyre detail page renders', async ({ page }) => {
    await page.goto('/shyny');

    // Click first tyre link
    const firstTyreLink = page.locator('a[href*="/shyny/"]').first();
    if (await firstTyreLink.isVisible()) {
      await firstTyreLink.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
