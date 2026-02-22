import { test, expect } from '@playwright/test';

test('About page loads', async ({ page }) => {
    await page.goto('/about');

    // Verify that the page loads and has content
    await expect(page).toHaveTitle(/.*About.*/i);

    // Check for some main content element - we use a generic check like text or main tag
    await expect(page.locator('main')).toBeVisible();
});
