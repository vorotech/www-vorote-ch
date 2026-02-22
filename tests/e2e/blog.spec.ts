import { test, expect } from '@playwright/test';

test('Blog page loads', async ({ page }) => {
    // Try /blog or /posts depending on the app structure
    await page.goto('/posts');

    // Test basic page loading by ensuring there's a heading or typical blog content
    await expect(page).toHaveTitle(/.*Blog.*/i);

    // Ensure that posts are visible
    const postLink = page.locator('a[href^="/posts/"]').first();
    await expect(postLink).toBeVisible({ timeout: 15000 });
});
