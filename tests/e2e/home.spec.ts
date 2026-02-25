import { expect, test } from '@playwright/test';

test('Home page loads and displays blog posts', async ({ page }) => {
  await page.goto('/');

  // Wait for blog posts to load (using an a tag that points to a post)
  // The user mentioned blog posts are loaded with a small delay
  const postLink = page.locator('a[href^="/posts/"]').first();
  await expect(postLink).toBeVisible({ timeout: 15000 });
});
