import { expect, test } from '@playwright/test';

test.describe('Scheduler tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/scheduler');
  });

  test('can load scheduler and toggle member configuration', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'On-Call Scheduler' })).toBeVisible();

    const configButton = page.getByRole('button', { name: /Member Configuration/i });
    await expect(configButton).toBeVisible();
    await configButton.click();

    await expect(page.locator('h2', { hasText: 'Member Configuration' }).first()).toBeVisible();
  });

  test('can change number of people', async ({ page }) => {
    const configButton = page.getByRole('button', { name: /Member Configuration/i });
    await configButton.click();

    const personInputs = page.locator('input[type="text"]');
    await expect(personInputs).toHaveCount(3);

    // The "Number of People" input is now the second number input (Year is first)
    const numMembersInput = page.locator('input[type="number"]').nth(1);
    await numMembersInput.fill('4');
    await expect(personInputs).toHaveCount(4);

    await numMembersInput.fill('2');
    await expect(personInputs).toHaveCount(2);
  });

  test('feedback form is accessible', async ({ page }) => {
    // Feedback form is rendered only after generating the schedule
    await page.getByRole('button', { name: /Generate Schedule|Generate/i }).click();

    await expect(page.locator('h3', { hasText: 'Feedback & Requests' })).toBeVisible({ timeout: 10000 });

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Message').fill('This is a test feedback message for playwright.');

    await expect(page.getByRole('button', { name: /Send Feedback/i })).toBeVisible();
  });
});
