import { test, expect } from '@playwright/test'

test.describe('AutoFix Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('aside', { timeout: 5000 })
  })

  test('should display issues when available', async ({ page }) => {
    // Navigate to AutoFix if there's a direct route, or check if component is visible
    // This test assumes AutoFix might be accessible via navigation or as part of another view
    
    // Wait for any issues to load
    await page.waitForTimeout(2000)
    
    // Check if issues section exists (might be empty)
    const issuesSection = page.locator('[class*="issue"], [class*="Issue"]').first()
    const issuesCount = await issuesSection.count()
    
    // Either issues are displayed or the "no issues" message
    const noIssuesMessage = page.getByText(/aucun problème/i)
    const hasIssues = issuesCount > 0
    const hasNoIssuesMessage = await noIssuesMessage.isVisible().catch(() => false)
    
    expect(hasIssues || hasNoIssuesMessage).toBeTruthy()
  })

  test('should allow diagnosing issues', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for diagnose button
    const diagnoseButton = page.getByText(/diagnostiquer|rediagnostiquer/i).first()
    const buttonExists = await diagnoseButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await diagnoseButton.click()
      await page.waitForTimeout(1000)
      
      // Check if solution appears or loading state
      const solution = page.locator('[class*="solution"], [class*="Solution"]').first()
      const loading = page.getByText(/diagnostic en cours/i)
      
      const hasSolution = await solution.isVisible().catch(() => false)
      const isLoading = await loading.isVisible().catch(() => false)
      
      expect(hasSolution || isLoading).toBeTruthy()
    }
  })
})

