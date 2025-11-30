import { test, expect } from '@playwright/test'

test.describe('Scan Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('aside', { timeout: 5000 })
  })

  test('can navigate to scan view', async ({ page }) => {
    const scanButton = page.locator('button').filter({ hasText: 'Nouveau Scan' }).first()
    await scanButton.click()
    
    await page.waitForTimeout(500)
    
    // Check if scan options or scan view is visible
    const scanView = page.locator('[class*="scan"], [class*="Scan"]').first()
    await expect(scanView).toBeVisible({ timeout: 3000 })
  })

  test('scan options form is displayed', async ({ page }) => {
    // Navigate to scan
    const scanButton = page.locator('button').filter({ hasText: 'Nouveau Scan' }).first()
    await scanButton.click()
    await page.waitForTimeout(500)
    
    // Look for scan options (path input, format select, etc.)
    const inputs = page.locator('input, select')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
  })
})

