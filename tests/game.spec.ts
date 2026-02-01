import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page title is correct
  await expect(page).toHaveTitle(/素因数分解ゲーム/);
  
  // Check that the main game container exists
  const gameContainer = page.locator('#root');
  await expect(gameContainer).toBeVisible();
});

test('game board is rendered', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the game to load
  await page.waitForLoadState('networkidle');
  
  // Check that the root element has content
  const root = page.locator('#root');
  await expect(root).not.toBeEmpty();
});
