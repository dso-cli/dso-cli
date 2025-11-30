import { test, expect } from '@playwright/test'

test.describe('Chat IA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('aside', { timeout: 5000 })
    
    // Navigate to chat
    const chatButton = page.locator('button').filter({ hasText: 'Assistant IA' }).first()
    await chatButton.click()
    await page.waitForTimeout(500)
  })

  test('chat interface is displayed', async ({ page }) => {
    const chatHeader = page.getByText('Assistant IA DSO')
    await expect(chatHeader).toBeVisible({ timeout: 3000 })
  })

  test('can type and send message', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="question"]')
    await expect(textarea).toBeVisible()
    
    await textarea.fill('Comment améliorer la sécurité ?')
    await textarea.press('Enter')
    
    // Wait for message to appear
    await page.waitForTimeout(1000)
    
    // Check if message was sent (should appear in chat)
    const messages = page.locator('[class*="message"], [class*="Message"]')
    await expect(messages.first()).toBeVisible({ timeout: 3000 })
  })

  test('displays welcome message initially', async ({ page }) => {
    const welcomeText = page.getByText('Bonjour ! Je suis votre assistant DSO')
    await expect(welcomeText).toBeVisible({ timeout: 3000 })
  })

  test('shows connection status', async ({ page }) => {
    const connectionStatus = page.getByText(/Connecté|Déconnecté/)
    await expect(connectionStatus).toBeVisible({ timeout: 3000 })
  })

  test('quick suggestions are clickable', async ({ page }) => {
    const suggestion = page.getByText('Comment améliorer la sécurité de mon projet ?')
    if (await suggestion.isVisible({ timeout: 2000 })) {
      await suggestion.click()
      await page.waitForTimeout(1000)
      // Message should be sent
      const textarea = page.locator('textarea')
      const value = await textarea.inputValue()
      expect(value).toBe('')
    }
  })
})

