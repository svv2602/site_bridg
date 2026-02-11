import { test, expect } from '@playwright/test';

test.describe('Articles / Blog', () => {
  test('blog index loads', async ({ page }) => {
    await page.goto('/advice');
    await expect(page).toHaveTitle(/[Пп]орад|[Бб]лог|[Сс]тат/);
  });

  test('article cards are visible', async ({ page }) => {
    await page.goto('/advice');

    const articles = page.locator('article, [data-testid="article-card"], .article-card');
    await expect(articles.first()).toBeVisible({ timeout: 10000 });
  });

  test('article detail page has content', async ({ page }) => {
    await page.goto('/advice');

    // Click first article link
    const firstArticleLink = page.locator('a[href*="/advice/"]').first();
    if (await firstArticleLink.isVisible()) {
      await firstArticleLink.click();

      // Article should have a heading and body content
      await expect(page.locator('h1')).toBeVisible();
      const content = page.locator('article, [data-testid="article-content"], .article-content, .prose');
      await expect(content.first()).toBeVisible();
    }
  });
});
