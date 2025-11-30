import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for app to load
    await page.waitForSelector('aside', { timeout: 5000 })
  })

  test('sidebar is visible and functional', async ({ page }) => {
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    
    // Check if sidebar contains navigation items
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Nouveau Scan')).toBeVisible()
    await expect(sidebar.getByText('Assistant IA')).toBeVisible()
  })

  test('can navigate to dashboard', async ({ page }) => {
    const dashboardButton = page.locator('button').filter({ hasText: 'Dashboard' }).first()
    await dashboardButton.click()
    
    // Wait for navigation
    await page.waitForTimeout(500)
    
    // Check if dashboard content is visible
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('can navigate to scan view', async ({ page }) => {
    const scanButton = page.locator('button').filter({ hasText: 'Nouveau Scan' }).first()
    await scanButton.click()
    
    await page.waitForTimeout(500)
    
    // Check if scan view is displayed
    const pageTitle = page.locator('h1, h2').filter({ hasText: /scan/i }).first()
    await expect(pageTitle).toBeVisible({ timeout: 2000 })
  })

  test('can navigate to chat view', async ({ page }) => {
    const chatButton = page.locator('button').filter({ hasText: 'Assistant IA' }).first()
    await chatButton.click()
    
    await page.waitForTimeout(500)
    
    // Check if chat is visible
    const chatComponent = page.locator('[class*="chat"], [class*="Chat"]').first()
    await expect(chatComponent).toBeVisible({ timeout: 2000 })
  })

  test('can toggle sidebar', async ({ page }) => {
    const sidebar = page.locator('aside')
    const toggleButton = sidebar.locator('button').last()
    
    // Get initial width
    const initialWidth = await sidebar.evaluate(el => el.clientWidth)
    
    // Click toggle
    await toggleButton.click()
    await page.waitForTimeout(300)
    
    // Check if width changed
    const newWidth = await sidebar.evaluate(el => el.clientWidth)
    expect(newWidth).not.toBe(initialWidth)
  })
})

