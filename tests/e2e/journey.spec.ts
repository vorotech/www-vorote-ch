import { expect, test } from '@playwright/test';

test.describe('Journey Component Visibility', () => {
  test('should render the journey title', async ({ page }) => {
    await page.goto('/about');
    const title = page.getByText('My Professional Journey');
    await expect(title).toBeVisible();
  });

  test('should render milestone titles', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('Security Foundations')).toBeVisible();
    await expect(page.getByText('Strategic Leadership')).toBeVisible();
  });

  test('should expand milestone on click and show full summary', async ({ page }) => {
    await page.goto('/about');

    const milestone = page.getByText('Security Foundations');
    await milestone.click();

    const summary = page.getByText('Early career building technical depth');
    await expect(summary).toBeVisible();
  });

  test('should show "Read Deep-Dive" link for milestones with posts', async ({ page }) => {
    await page.goto('/about');

    const milestone = page.getByText('Strategic Leadership');
    await milestone.click();

    const deepDiveLink = page.getByRole('link', { name: /Read Professional Deep-Dive/i });
    await expect(deepDiveLink).toBeVisible();
    // The URL generation in journey-milestone.tsx uses breadcrumbs
    await expect(deepDiveLink).toHaveAttribute('href', /\/posts\/2025\/The-Modern-CISO-From-Doer-to-Enabler/);
  });
});
