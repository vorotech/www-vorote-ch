import { test, expect } from '@playwright/test';

test('Blog post page loads and link element works', async ({ page }) => {
    await page.goto('/posts/2025/CISO-Assistant-Your-Open-Source-GRC-Powerhouse');

    // Verify heading/content
    await expect(page).toHaveTitle(/.*CISO Assistant.*/i);
    await expect(page.locator('h3', { hasText: 'What is CISO Assistant?' })).toBeVisible({ timeout: 10000 });

    // Verify the link element (FeaturedLink from the user prompt)
    // We check for an `a` tag that might open in a new tab, or has the class group
    const featuredLink = page.locator('a[target="_blank"]').first();
    await expect(featuredLink).toBeVisible();
});
