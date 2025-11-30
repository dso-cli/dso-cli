import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
  mangle: false
} as any)

// Custom renderer to add security
const renderer = new marked.Renderer()

// Override link renderer to add security
renderer.link = (({ href, title, text }: any) => {
  // Only allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:']
  try {
    const url = new URL(href, 'https://example.com')
    if (!safeProtocols.includes(url.protocol)) {
      return text // Return text without link if unsafe
    }
  } catch {
    return text
  }
  
  return `<a href="${DOMPurify.sanitize(href)}" target="_blank" rel="noopener noreferrer" ${title ? `title="${DOMPurify.sanitize(title)}"` : ''}>${text}</a>`
}) as any

// Override code renderer to prevent XSS
renderer.code = (({ text, lang }: any) => {
  const sanitizedCode = DOMPurify.sanitize(text)
  const language = lang ? DOMPurify.sanitize(lang) : ''
  return `<pre><code class="language-${language}">${sanitizedCode}</code></pre>`
}) as any

marked.use({ renderer })

/**
 * Safely render markdown to HTML
 * @param markdown - Markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  // First, render markdown to HTML
  const html = marked.parse(markdown) as string
  
  // Then sanitize the HTML to prevent XSS
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'a', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  })
}

/**
 * Validate and sanitize user input
 * @param input - User input string
 * @returns Sanitized and validated input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 5000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Check if input contains potentially dangerous patterns
 * @param input - User input string
 * @returns true if input is safe, false otherwise
 */
export function isInputSafe(input: string): boolean {
  if (!input) return true
  
  // Patterns to detect potential injection attempts
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

