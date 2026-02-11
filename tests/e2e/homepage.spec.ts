import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bridgestone/);
  });

  test('navigation is visible', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('search tabs are functional', async ({ page }) => {
    await page.goto('/');

    // Look for search section with tabs (by size / by car)
    const searchSection = page.getByRole('tablist');
    if (await searchSection.isVisible()) {
      const tabs = searchSection.getByRole('tab');
      await expect(tabs).toHaveCount(2);

      // Click second tab
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
