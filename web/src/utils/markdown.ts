import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false, // Disable header IDs for security
  mangle: false,
  sanitize: false, // We'll use DOMPurify instead
})

// Custom renderer to add security
const renderer = new marked.Renderer()

// Override link renderer to add security
renderer.link = (href: string, title: string | null, text: string) => {
  // Only allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:']
  const url = new URL(href, 'https://example.com')
  
  if (!safeProtocols.includes(url.protocol)) {
    return text // Return text without link if unsafe
  }
  
  return `<a href="${DOMPurify.sanitize(href)}" target="_blank" rel="noopener noreferrer" ${title ? `title="${DOMPurify.sanitize(title)}"` : ''}>${text}</a>`
}

// Override code renderer to prevent XSS
renderer.code = (code: string, language?: string) => {
  const sanitizedCode = DOMPurify.sanitize(code)
  const lang = language ? DOMPurify.sanitize(language) : ''
  return `<pre><code class="language-${lang}">${sanitizedCode}</code></pre>`
}

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

