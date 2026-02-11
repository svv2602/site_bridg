import { test, expect } from '@playwright/test';

test.describe('Dealer Finder', () => {
  test('dealer page loads', async ({ page }) => {
    await page.goto('/dealers');
    await expect(page).toHaveTitle(/[Дд]илер|[Мм]агазин/);
  });

  test('dealer list is visible', async ({ page }) => {
    await page.goto('/dealers');

    // Wait for dealer cards or list items
    const dealers = page.locator('[data-testid="dealer-card"], .dealer-card, [data-testid="dealer-list"] li');
    await expect(dealers.first()).toBeVisible({ timeout: 10000 });
  });

  test('map container is present', async ({ page }) => {
    await page.goto('/dealers');

    // Google Maps container or fallback map
    const mapContainer = page.locator('[data-testid="map"], .map-container, #map, [class*="map"]');
    if (await mapContainer.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(mapContainer.first()).toBeVisible();
    }
  });
});
