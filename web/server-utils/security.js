/**
 * Security utilities for the DSO API server
 */

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map()

/**
 * Rate limiting middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Object} options - Rate limit options
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // max requests per window
    message = 'Too many requests, please try again later.'
  } = options

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress
    const now = Date.now()
    
    // Clean old entries
    if (rateLimitStore.size > 10000) {
      const cutoff = now - windowMs
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < cutoff) {
          rateLimitStore.delete(k)
        }
      }
    }
    
    const record = rateLimitStore.get(key)
    
    if (!record || record.resetTime < now) {
      // Create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return next()
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      })
    }
    
    record.count++
    next()
  }
}

/**
 * Sanitize user input
 * @param {string} input - User input
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, maxLength = 5000) {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validate input for dangerous patterns
 * @param {string} input - User input
 * @returns {boolean} True if safe
 */
function isInputSafe(input) {
  if (!input || typeof input !== 'string') {
    return true
  }
  
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /eval\(/gi,
    /expression\(/gi
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate chat message
 * @param {string} message - Chat message
 * @returns {Object} Validation result
 */
function validateChatMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' }
  }
  
  const sanitized = sanitizeInput(message, 5000)
  
  if (!sanitized) {
    return { valid: false, error: 'Message cannot be empty' }
  }
  
  if (!isInputSafe(sanitized)) {
    return { valid: false, error: 'Message contains potentially dangerous content' }
  }
  
  return { valid: true, sanitized }
}

module.exports = {
  rateLimit,
  sanitizeInput,
  isInputSafe,
  validateChatMessage
}

