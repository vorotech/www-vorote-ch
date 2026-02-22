import { test, expect } from '@playwright/test';

test('Tools page loads', async ({ page }) => {
    await page.goto('/tools');

    await expect(page).toHaveTitle(/.*Tools.*/i);
    // Verify tools page has links to specific tools, e.g., Scheduler
    const schedulerLink = page.locator('a[href*="/tools/scheduler"]').first();
    await expect(schedulerLink).toBeVisible();
});
