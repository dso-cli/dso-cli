import { describe, it, expect } from 'vitest'
import { renderMarkdown, sanitizeInput, isInputSafe } from '../../utils/markdown'

describe('markdown utils', () => {
  describe('renderMarkdown', () => {
    it('renders basic markdown', () => {
      const result = renderMarkdown('# Title\n\n**Bold** text')
      expect(result).toContain('<h1>')
      expect(result).toContain('<strong>')
    })

    it('renders code blocks', () => {
      const result = renderMarkdown('```bash\necho "test"\n```')
      expect(result).toContain('<pre>')
      expect(result).toContain('<code>')
    })

    it('sanitizes dangerous content', () => {
      const result = renderMarkdown('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeInput', () => {
    it('removes control characters', () => {
      const result = sanitizeInput('test\x00\x01\x02')
      expect(result).not.toContain('\x00')
    })

    it('limits length', () => {
      const longText = 'a'.repeat(10000)
      const result = sanitizeInput(longText)
      expect(result.length).toBeLessThanOrEqual(5000)
    })

    it('trims whitespace', () => {
      const result = sanitizeInput('  test  ')
      expect(result).toBe('test')
    })
  })

  describe('isInputSafe', () => {
    it('detects script tags', () => {
      expect(isInputSafe('<script>alert("xss")</script>')).toBe(false)
    })

    it('detects javascript: protocol', () => {
      expect(isInputSafe('javascript:alert("xss")')).toBe(false)
    })

    it('detects event handlers', () => {
      expect(isInputSafe('<div onclick="alert(1)">')).toBe(false)
    })

    it('allows safe content', () => {
      expect(isInputSafe('Hello world')).toBe(true)
      expect(isInputSafe('**Bold** text')).toBe(true)
    })
  })
})

