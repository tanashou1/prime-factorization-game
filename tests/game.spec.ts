import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page title is correct
  await expect(page).toHaveTitle(/prime-factorization-game/i);
  
  // Check that the main game container exists
  const gameContainer = page.locator('#root');
  await expect(gameContainer).toBeVisible();
});

test('game board is rendered', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the game board to be rendered
  await page.waitForSelector('.game-board', { timeout: 5000 });
  
  // Check that the game board is visible
  const gameBoard = page.locator('.game-board');
  await expect(gameBoard).toBeVisible();
});
