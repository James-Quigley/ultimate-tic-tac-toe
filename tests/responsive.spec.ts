import { test, expect } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {
  test('game board should fit within viewport width', async ({ page }) => {
    await page.goto('/');

    // Wait for the board to be visible
    const megaBoard = page.locator('#mega-board');
    await expect(megaBoard).toBeVisible();

    // Get viewport width
    const viewportSize = page.viewportSize();
    const viewportWidth = viewportSize!.width;

    // Get board bounding box
    const boardBox = await megaBoard.boundingBox();
    const boardWidth = boardBox!.width;
    const boardRight = boardBox!.x + boardBox!.width;

    console.log(`Viewport width: ${viewportWidth}px`);
    console.log(`Board width: ${boardWidth}px`);
    console.log(`Board right edge: ${boardRight}px`);
    console.log(`Board fits: ${boardRight <= viewportWidth}`);

    // Board should not exceed viewport width
    expect(boardRight).toBeLessThanOrEqual(viewportWidth);

    // Board should not cause horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('all game elements should fit within viewport', async ({ page }) => {
    await page.goto('/');

    const viewportSize = page.viewportSize();
    const viewportWidth = viewportSize!.width;

    // Check all major elements
    const elements = ['#app', '#mega-board', 'header', '#controls'];

    for (const selector of elements) {
      const element = page.locator(selector);
      await expect(element).toBeVisible();

      const box = await element.boundingBox();
      const rightEdge = box!.x + box!.width;

      console.log(`${selector}: width=${box!.width}px, right edge=${rightEdge}px`);
      expect(rightEdge).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test('no horizontal overflow on page', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('#mega-board', { state: 'visible' });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;

    console.log(`Body scroll width: ${bodyWidth}px`);
    console.log(`Viewport width: ${viewportWidth}px`);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
