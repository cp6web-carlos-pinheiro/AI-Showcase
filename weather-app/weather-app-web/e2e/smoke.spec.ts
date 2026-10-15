import { expect, test } from '@playwright/test';
import { mockOpenMeteo } from './helpers';

test('smoke: empty state inicial e busca bem sucedida', async ({ page }) => {
  await mockOpenMeteo(page);

  await page.goto('/');

  const emptyState = page.locator('.state-panel[data-state="empty-inicial"]');
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toContainText('Busque por uma cidade para ver o clima.');

  await page.getByLabel('Buscar cidade').fill('Rio de Janeiro');
  await page.getByTestId('search-button').click();

  await expect(page.getByTestId('city')).toContainText('Rio de Janeiro, BR');
  await expect(page.getByTestId('temperature')).toContainText('23');
  await expect(page.getByTestId('sidebar')).toBeVisible();
  await expect(page.locator('.weather-backdrop svg')).toBeVisible();
  await expect(page.getByTestId('main-area')).toBeVisible();
  await expect(emptyState).toBeHidden();
  await expect(page.locator('.state-panel[data-state="resultado"]')).toBeHidden();
  await expect(page.locator('[aria-live="polite"]')).toBeEmpty();
});
