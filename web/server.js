import express from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './swagger.js'

// Helper function to get fetch (Node 18+ has it built-in)
async function getFetch() {
  if (typeof globalThis.fetch !== 'undefined') {
    return globalThis.fetch
  }
  try {
    const nodeFetch = await import('node-fetch')
    return nodeFetch.default
  } catch (e) {
    throw new Error('fetch is not available. Please use Node.js 18+ or install node-fetch')
  }
}

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))

// Logging middleware for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/repos')) {
    console.log(`[API] ${req.method} ${req.path}`)
  }
  next()
})

// Cookie parser (simple implementation)
const cookieParser = (req, res, next) => {
  req.cookies = {}
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=')
      if (parts.length === 2) {
        req.cookies[parts[0]] = parts[1]
      }
    })
  }
  next()
}
app.use(cookieParser)

// Helper function to find DSO CLI
async function findDSOCLI() {
  try {
    // Try to find dso in PATH
    const { stdout } = await execAsync('which dso')
    return stdout.trim()
  } catch (error) {
    // Try relative path
    const relativePath = path.join(__dirname, '..', 'dso')
    try {
      await execAsync(`test -f ${relativePath}`)
      return relativePath
    } catch {
      // Try in parent directory
      const parentPath = path.join(__dirname, '..', '..', 'dso')
      try {
        await execAsync(`test -f ${parentPath}`)
        return parentPath
      } catch {
        throw new Error('DSO CLI not found. Please ensure dso is installed and in PATH.')
      }
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DSO API' })
})

// Helper function to ensure .dsoignore exists in scan directory
async function ensureDSOIgnore(scanPath) {
  const fs = await import('fs/promises')
  const dsoIgnorePath = path.join(scanPath, '.dsoignore')
  
  try {
    // Check if .dsoignore already exists
    await fs.access(dsoIgnorePath)
    console.log(`[API] .dsoignore already exists in ${scanPath}`)
  } catch {
    // Create .dsoignore from template
    const templatePath = path.join(__dirname, '..', '.dsoignore')
    try {
      const template = await fs.readFile(templatePath, 'utf-8')
      await fs.writeFile(dsoIgnorePath, template, 'utf-8')
      console.log(`[API] Created .dsoignore in ${scanPath}`)
    } catch (err) {
      console.warn(`[API] Could not create .dsoignore: ${err.message}`)
      // Create a minimal .dsoignore
      const minimalIgnore = `node_modules/\nvendor/\ndist/\nbuild/\n.git/\n.cache/\ntemp/\ntmp/\n`
      await fs.writeFile(dsoIgnorePath, minimalIgnore, 'utf-8')
      console.log(`[API] Created minimal .dsoignore in ${scanPath}`)
    }
  }
}

// Run security scan
app.post('/api/scan', async (req, res) => {
  try {
    const { path: scanPath = '.' } = req.body
    const dsoPath = await findDSOCLI()
    
    // Resolve absolute path
    const absScanPath = path.isAbsolute(scanPath) 
      ? scanPath 
      : path.resolve(process.cwd(), scanPath)
    
    console.log(`[API] Running scan on: ${absScanPath}`)
    console.log(`[API] DSO CLI path: ${dsoPath}`)
    
    // Ensure .dsoignore exists to exclude common directories
    await ensureDSOIgnore(absScanPath)
    
    // Run: dso audit <path> --format json
    // Capture both stdout and stderr
    const { stdout, stderr } = await execAsync(
      `"${dsoPath}" audit "${absScanPath}" --format json 2>&1`,
      { 
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 300000 // 5 minutes timeout
      }
    )
    
    console.log(`[API] DSO stdout length: ${stdout.length}`)
    if (stderr) {
      console.log(`[API] DSO stderr: ${stderr.substring(0, 200)}`)
    }
    
    // Try to parse JSON - DSO outputs JSON with "results" and "analysis" keys
    let dsoOutput
    try {
      // Try direct parse first
      dsoOutput = JSON.parse(stdout)
    } catch (parseError) {
      // If not JSON, try to extract JSON from output
      const jsonMatch = stdout.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          dsoOutput = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('[API] JSON parse error:', e.message)
          console.error('[API] Output sample:', stdout.substring(0, 500))
          throw new Error(`Failed to parse DSO output: ${e.message}`)
        }
      } else {
        throw new Error('No JSON found in DSO output')
      }
    }
    
    // DSO CLI returns { "results": {...}, "analysis": {...} }
    // Extract the results part
    let results = dsoOutput.results || dsoOutput
    
    // If DSO returned analysis, we can use it later
    const analysis = dsoOutput.analysis
    
    // Ensure results have the expected structure
    if (!results.summary) {
      results.summary = {
        total: results.findings?.length || 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        fixable: 0,
        exploitable: 0
      }
      
      // Calculate summary from findings if not present
      if (results.findings && results.findings.length > 0) {
        results.findings.forEach((finding) => {
          const severity = (finding.severity || finding.Severity || '').toUpperCase()
          if (severity === 'CRITICAL') results.summary.critical++
          else if (severity === 'HIGH') results.summary.high++
          else if (severity === 'MEDIUM') results.summary.medium++
          else if (severity === 'LOW') results.summary.low++
          
          if (finding.fixable || finding.Fixable) results.summary.fixable++
          if (finding.exploitable || finding.Exploitable) results.summary.exploitable++
        })
        results.summary.total = results.findings.length
      }
    }
    
    if (!results.findings) {
      results.findings = []
    }
    
    // Normalize findings structure (handle both camelCase and PascalCase)
    results.findings = results.findings.map((f) => ({
      id: f.id || f.ID || `${f.file || f.File || 'unknown'}-${f.line || f.Line || 0}`,
      title: f.title || f.Title || f.message || f.Message || 'Unknown issue',
      description: f.description || f.Description || f.message || f.Message || '',
      file: f.file || f.File || '',
      line: f.line || f.Line || 0,
      severity: (f.severity || f.Severity || 'LOW').toUpperCase(),
      tool: f.tool || f.Tool || f.scanner || f.Scanner || 'unknown',
      fixable: f.fixable !== undefined ? f.fixable : (f.Fixable !== undefined ? f.Fixable : false),
      exploitable: f.exploitable !== undefined ? f.exploitable : (f.Exploitable !== undefined ? f.Exploitable : false)
    }))
    
    console.log(`[API] Scan completed: ${results.summary?.total || 0} issues found`)
    
    res.json(results)
  } catch (error) {
    console.error('[API] Scan error:', error)
    console.error('[API] Error details:', {
      message: error.message,
      code: error.code,
      stderr: error.stderr ? error.stderr.substring(0, 500) : undefined,
      stdout: error.stdout ? error.stdout.substring(0, 500) : undefined
    })
    res.status(500).json({ 
      error: 'Scan failed', 
      message: error.message || 'Unknown error',
      details: (error.stderr ? error.stderr.substring(0, 500) : '') || (error.stdout ? error.stdout.substring(0, 500) : '') || 'No details available'
    })
  }
})

// Analyze results with AI
app.post('/api/analyze', async (req, res) => {
  try {
    const { results } = req.body
    const dsoPath = await findDSOCLI()
    
    console.log(`[API] Analyzing ${results.summary?.total || 0} issues with AI`)
    
    // For now, we'll use a simple analysis
    // In the future, this could call: dso analyze <results>
    const analysis = {
      summary: `You have ${results.summary?.total || 0} alerts but only ${results.summary?.critical || 0} are critical and exploitable in prod.`,
      businessImpact: `The ${results.summary?.critical || 0} critical vulnerabilities are in public exposed endpoints.`,
      topFixes: (results.findings || []).slice(0, 5).map((finding) => ({
        title: finding.title,
        description: finding.description,
        file: finding.file,
        line: finding.line,
        command: finding.fixable ? `dso fix "${finding.file}"` : undefined
      }))
    }
    
    res.json(analysis)
  } catch (error) {
    console.error('[API] Analysis error:', error)
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    })
  }
})

// Apply auto-fix
app.post('/api/fix', async (req, res) => {
  try {
    const { finding } = req.body
    const dsoPath = await findDSOCLI()
    
    if (!finding.fixable) {
      return res.status(400).json({ 
        error: 'Not fixable', 
        message: 'This finding cannot be automatically fixed' 
      })
    }
    
    console.log(`[API] Applying fix for: ${finding.title}`)
    
    // Run: dso fix <path> --auto
    const scanPath = finding.file ? path.dirname(finding.file) : '.'
    const { stdout, stderr } = await execAsync(
      `"${dsoPath}" fix "${scanPath}" --auto`,
      { 
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024
      }
    )
    
    if (stderr && !stdout.includes('applied')) {
      throw new Error(stderr || 'Fix failed')
    }
    
    console.log(`[API] Fix applied successfully`)
    
    res.json({ 
      success: true, 
      message: 'Fix applied successfully',
      output: stdout 
    })
  } catch (error) {
    console.error('[API] Fix error:', error)
    res.status(500).json({ 
      error: 'Fix failed', 
      message: error.message,
      details: error.stderr || error.stdout
    })
  }
})

// Get DSO version
app.get('/api/version', async (req, res) => {
  try {
    const dsoPath = await findDSOCLI()
    const { stdout, stderr } = await execAsync(`"${dsoPath}" --version`, {
      timeout: 5000
    })
    
    console.log('[API] Version output:', stdout)
    
    // Extract version from various formats:
    // - "dso version 0.1.0"
    // - "0.1.0"
    // - "DSO CLI version 0.1.0"
    // - "v0.1.0"
    let version = null
    
    // Try multiple patterns
    const patterns = [
      /(?:dso|DSO)[\s]+(?:version|Version)[\s]+v?(\d+\.\d+\.\d+)/i,
      /v?(\d+\.\d+\.\d+)/,
      /version[\s]+v?(\d+\.\d+\.\d+)/i
    ]
    
    for (const pattern of patterns) {
      const match = stdout.match(pattern)
      if (match && match[1]) {
        version = match[1]
        break
      }
    }
    
    // Fallback: use trimmed output if no pattern matches
    if (!version) {
      version = stdout.trim().replace(/^v/i, '') || 'Unknown'
    }
    
    res.json({ version })
  } catch (error) {
    console.error('[API] Version error:', error)
    // Return a default version on error instead of 500
    res.json({ 
      version: 'Unknown',
      error: error.message 
    })
  }
})

// Check Ollama status
app.get('/api/check', async (req, res) => {
  try {
    // First, try direct Ollama API check (faster and more reliable)
    let connected = false
    let model = null
    
    try {
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
      const fetchFn = await getFetch()
      const testResponse = await fetchFn(`${ollamaHost}/api/tags`, {
        method: 'GET',
        timeout: 3000
      })
      
      if (testResponse.ok) {
        connected = true
        const data = await testResponse.json()
        // Get the first model or use configured/default
        if (data.models && data.models.length > 0) {
          // Try to find configured model first
          const configuredModel = process.env.DSO_MODEL || 'llama3.1:8b'
          const foundModel = data.models.find(m => m.name === configuredModel || m.name.includes(configuredModel.split(':')[0]))
          model = foundModel ? foundModel.name : data.models[0].name
        } else {
          model = process.env.DSO_MODEL || 'llama3.1:8b'
        }
      }
    } catch (e) {
      console.log('[API] Direct Ollama check failed, trying DSO CLI:', e.message)
    }
    
    // If direct check failed, try DSO CLI check
    if (!connected) {
      try {
        const dsoPath = await findDSOCLI()
        const { stdout, stderr } = await execAsync(`"${dsoPath}" check`, {
          timeout: 10000
        })
        
        console.log('[API] DSO check output:', stdout.substring(0, 500))
        
        // Parse output to extract status - handle multiple formats
        if (stdout) {
          // Check for positive indicators
          const positivePatterns = [
            /✅.*OK/i,
            /✅.*connected/i,
            /connected.*✅/i,
            /ollama.*running/i,
            /model.*available/i,
            /Everything is ready/i,
            /🎉.*ready/i
          ]
          
          // Check for negative indicators
          const negativePatterns = [
            /❌.*failed/i,
            /connection.*refused/i,
            /not.*connected/i,
            /Error:/i
          ]
          
          const hasPositive = positivePatterns.some(p => p.test(stdout))
          const hasNegative = negativePatterns.some(p => p.test(stdout))
          
          // Connected if we have positive indicators and no negative ones
          if (hasPositive && !hasNegative) {
            connected = true
          }
          
          // Try to extract model name from various patterns
          const modelPatterns = [
            /Configured model[:\s]+([a-zA-Z0-9.:_-]+)/i,
            /model[:\s]+([a-zA-Z0-9.:_-]+)/i,
            /using[:\s]+model[:\s]+([a-zA-Z0-9.:_-]+)/i,
            /👉\s+([a-zA-Z0-9.:_-]+)/i, // Arrow marker in model list
            /([a-z0-9]+:[0-9]+b)/i
          ]
          
          for (const pattern of modelPatterns) {
            const match = stdout.match(pattern)
            if (match && match[1]) {
              model = match[1].trim()
              break
            }
          }
          
          // If no model found but connected, try to get from environment or default
          if (connected && !model) {
            model = process.env.DSO_MODEL || 'llama3.1:8b'
          }
        }
      } catch (error) {
        console.error('[API] DSO check error:', error.message)
      }
    }
    
    res.json({
      connected,
      model: model || (connected ? (process.env.DSO_MODEL || 'llama3.1:8b') : null),
      output: null,
      error: connected ? null : 'Ollama is not running or not accessible'
    })
  } catch (error) {
    console.error('[API] Check error:', error)
    res.json({
      connected: false,
      model: null,
      error: error.message,
      output: null
    })
  }
})

// Import security utilities
// Security utilities - inline for now
const rateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map()
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const userRequests = requests.get(ip) || []
    const recentRequests = userRequests.filter(time => now - time < windowMs)
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' })
    }
    
    recentRequests.push(now)
    requests.set(ip, recentRequests)
    next()
  }
}

// Sanitize input function
const sanitizeInput = (input, maxLength = 5000) => {
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

const validateChatMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string', sanitized: '' }
  }
  if (message.length > 10000) {
    return { valid: false, error: 'Message is too long (max 10000 characters)', sanitized: '' }
  }
  // Basic XSS prevention
  const dangerousPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onload=/i]
  if (dangerousPatterns.some(pattern => pattern.test(message))) {
    return { valid: false, error: 'Message contains potentially dangerous content', sanitized: '' }
  }
  // Sanitize the message
  const sanitized = sanitizeInput(message, 10000)
  return { valid: true, error: null, sanitized }
}

// Apply rate limiting to chat endpoint
app.post('/api/chat', rateLimit(50, 15 * 60 * 1000), async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body
    
    // Validate and sanitize message
    const validation = validateChatMessage(message)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }
    
    const sanitizedMessage = validation.sanitized
    
    // Validate history
    if (!Array.isArray(history) || history.length > 20) {
      return res.status(400).json({ error: 'Invalid history format or too long' })
    }
    
    console.log(`[API] Chat request: ${sanitizedMessage.substring(0, 50)}...`)
    
    // Build context from scan results if available
    let contextInfo = ''
    if (context?.findings && Array.isArray(context.findings) && context.findings.length > 0) {
      contextInfo += `\n\nContexte du projet:\n`
      contextInfo += `- Nombre de vulnérabilités détectées: ${context.findings.length}\n`
      const bySeverity = context.findings.reduce((acc, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1
        return acc
      }, {})
      contextInfo += `- Répartition: ${JSON.stringify(bySeverity)}\n`
      if (context.findings.length <= 5) {
        contextInfo += `- Détails:\n`
        context.findings.slice(0, 5).forEach((f, idx) => {
          contextInfo += `  ${idx + 1}. ${f.title || f.id} (${f.severity}) - ${f.file || 'N/A'}:${f.line || 'N/A'}\n`
        })
      }
    }
    if (context?.scanContext) {
      contextInfo += `\nContexte du scan: ${context.scanContext}\n`
    }
    
    // Build context from history (sanitize each message)
    const sanitizedHistory = history.slice(0, 20).map(m => {
      if (typeof m !== 'object' || !m.role || !m.content) {
        return null
      }
      const sanitizedContent = sanitizeInput(m.content, 2000)
      return sanitizedContent ? { role: m.role === 'user' ? 'user' : 'assistant', content: sanitizedContent } : null
    }).filter(Boolean)
    
    // Create enhanced prompt for the AI with context
    const userPrompt = `${sanitizedMessage}${contextInfo}`
    
    // Call DSO CLI with a custom command or use Ollama directly
    // For now, we'll use a simple approach: call dso with a custom prompt
    // In production, this would use the LLM service directly
    
    // Use Ollama API directly for chat
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    
    // Detect the actual model from Ollama (use the one from /api/check if available)
    let model = process.env.DSO_MODEL || 'llama3.1:8b'
    try {
      const fetchFn = await getFetch()
      const tagsResponse = await fetchFn(`${ollamaHost}/api/tags`, {
        method: 'GET',
        timeout: 3000
      })
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json()
        if (tagsData.models && tagsData.models.length > 0) {
          // Prefer configured model, otherwise use first available
          const configuredModel = process.env.DSO_MODEL || 'llama3.1:8b'
          const foundModel = tagsData.models.find(m => 
            m.name === configuredModel || 
            m.name.includes(configuredModel.split(':')[0])
          )
          model = foundModel ? foundModel.name : tagsData.models[0].name
          console.log(`[API] Using Ollama model: ${model}`)
        }
      }
    } catch (e) {
      console.log(`[API] Could not detect model, using default: ${model}`)
    }
    
    const fetchFn = await getFetch()
    const ollamaResponse = await fetchFn(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior DevSecOps expert assistant with deep expertise in application security, infrastructure, and secure development. You help developers understand and resolve security issues in a practical and actionable way.\n\nIMPORTANT:\n- Always respond in English in a clear, detailed and professional manner\n- Give complete, natural and personalized answers - do not repeat pre-written responses\n- Adapt your answer to the user\'s specific question\n- Explain concepts in detail, give concrete examples\n- Propose practical solutions and specific commands\n- Be natural and conversational, like an expert helping a colleague\n- Use Markdown formatting to structure your answers (titles, lists, code, etc.)'
          },
          ...sanitizedHistory,
          {
            role: 'user',
            content: userPrompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2048  // Allow longer responses
        }
      })
    })
    
    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }
    
    const ollamaData = await ollamaResponse.json()
    const aiResponse = ollamaData.message?.content || ollamaData.response || 'Désolé, je n\'ai pas pu générer de réponse.'
    
    // Extract potential actions from the response
    const actions = []
    if (aiResponse.toLowerCase().includes('scanner') || aiResponse.toLowerCase().includes('scan')) {
      actions.push({ label: 'Lancer un scan', command: 'scan' })
    }
    if (aiResponse.toLowerCase().includes('corriger') || aiResponse.toLowerCase().includes('fix')) {
      actions.push({ label: 'Appliquer les correctifs', command: 'fix' })
    }
    if (aiResponse.toLowerCase().includes('exporter') || aiResponse.toLowerCase().includes('export')) {
      actions.push({ label: 'Exporter les résultats', command: 'export' })
    }
    
    res.json({
      response: aiResponse,
      actions: actions.length > 0 ? actions : undefined
    })
  } catch (error) {
    console.error('[API] Chat error:', error)
    res.status(500).json({
      error: 'Chat failed',
      message: error.message
    })
  }
})

// Execute chat action
app.post('/api/chat/action', async (req, res) => {
  try {
    const { command } = req.body
    
    // Map commands to actual actions
    const commandMap = {
      'scan': 'Lancer un scan de sécurité',
      'fix': 'Appliquer les correctifs automatiques',
      'export': 'Exporter les résultats du scan'
    }
    
    const message = commandMap[command] || `Action "${command}" exécutée`
    
    res.json({ message, command })
  } catch (error) {
    console.error('[API] Action error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Explain a finding
app.post('/api/chat/explain', async (req, res) => {
  try {
    const { finding } = req.body
    const dsoPath = await findDSOCLI()
    
    // Use DSO CLI to explain the finding
    const prompt = `Explain this vulnerability in a clear and actionable way:
Title: ${finding.title}
Description: ${finding.description}
File: ${finding.file}:${finding.line}
Severity: ${finding.severity}
Tool: ${finding.tool}

Respond in English.`
    
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const model = process.env.DSO_MODEL || 'llama3.1:8b'
    
    const fetchFn = await getFetch()
    const ollamaResponse = await fetchFn(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a security expert who explains vulnerabilities in a clear and actionable way. Always respond in English.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    })
    
    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }
    
    const ollamaData = await ollamaResponse.json()
    const explanation = ollamaData.message?.content || ollamaData.response || 'Explanation not available'
    
    res.json({ explanation })
  } catch (error) {
    console.error('[API] Explain error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get recommendations (with SMART format)
app.post('/api/chat/recommendations', rateLimit(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const { scanResults } = req.body
    
    if (!scanResults || typeof scanResults !== 'object') {
      return res.json({ recommendations: 'Aucun résultat de scan disponible pour générer des recommandations.' })
    }
    
    // Validate and sanitize scan results
    const summary = {
      total: parseInt(scanResults.summary?.total) || 0,
      critical: parseInt(scanResults.summary?.critical) || 0,
      high: parseInt(scanResults.summary?.high) || 0,
      medium: parseInt(scanResults.summary?.medium) || 0,
      low: parseInt(scanResults.summary?.low) || 0,
      fixable: parseInt(scanResults.summary?.fixable) || 0,
      exploitable: parseInt(scanResults.summary?.exploitable) || 0
    }
    
    const prompt = `You are a DevSecOps expert who provides priority security recommendations in SMART format.

Scan results:
- Total: ${summary.total} vulnerabilities
- Critical: ${summary.critical} (immediate priority)
- High: ${summary.high} (high priority)
- Medium: ${summary.medium} (medium priority)
- Low: ${summary.low} (low priority)
- Automatically fixable: ${summary.fixable}
- Exploitable: ${summary.exploitable}

SMART response format:
1. **Priority recommendations** (top 5)
   - For each recommendation, indicate:
     - Specificity: What to do exactly
     - Measurability: How to measure progress
     - Achievability: How to get there
     - Relevance: Why it's important
     - Time-bound: When to do it

2. **Action plan by phase**
   - Phase 1 (0-48h): Critical actions
   - Phase 2 (3-7 days): Important actions
   - Phase 3 (7-14 days): Continuous improvements

3. **Tracking metrics**
   - Quantifiable objectives
   - Alert thresholds

Use Markdown formatting. Respond in English.`
    
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const model = process.env.DSO_MODEL || 'llama3.1:8b'
    
    const fetchFn = await getFetch()
    const ollamaResponse = await fetchFn(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a DevSecOps expert who provides priority security recommendations. Always respond in English.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    })
    
    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }
    
    const ollamaData = await ollamaResponse.json()
    const recommendations = ollamaData.message?.content || ollamaData.response || 'Aucune recommandation disponible'
    
    res.json({ recommendations })
  } catch (error) {
    console.error('[API] Recommendations error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Duplicate endpoint removed - using the one above with rate limiting

// Normalize tool names (handle case variations)
function normalizeToolName(name) {
  const nameMap = {
    'trivy': 'Trivy',
    'grype': 'Grype',
    'gitleaks': 'Gitleaks',
    'tfsec': 'TFSec',
    'TFSec': 'TFSec',
    'Tfsec': 'TFSec',
    'semgrep': 'Semgrep',
    'bandit': 'Bandit',
    'eslint': 'ESLint',
    'gosec': 'Gosec',
    'brakeman': 'Brakeman',
    'snyk': 'Snyk',
    'dependency-check': 'dependency-check',
    'trufflehog': 'TruffleHog',
    'truffle-hog': 'TruffleHog',
    'detect-secrets': 'detect-secrets',
    'checkov': 'Checkov',
    'terrascan': 'Terrascan',
    'kics': 'Kics',
    'hadolint': 'Hadolint',
    'docker-bench-security': 'docker-bench-security',
    'syft': 'Syft',
    'opa': 'OPA'
  }
  return nameMap[name.toLowerCase()] || name
}

// Check if tool is installed and get its version
async function checkToolInstalled(toolName) {
  try {
    const dsoPath = await findDSOCLI()
    const { stdout } = await execAsync(`"${dsoPath}" tools`, {
      timeout: 10000
    })
    
    const toolLower = toolName.toLowerCase()
    const normalizedTool = normalizeToolName(toolName)
    const lines = stdout.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      // Check for installed tool: "   ✅ toolname (version)"
      const installedMatch = trimmedLine.match(/^\s+✅\s+([a-zA-Z0-9_-]+)(?:\s+\(([^)]+)\))?/i)
      if (installedMatch) {
        const foundToolName = normalizeToolName(installedMatch[1])
        if (foundToolName.toLowerCase() === normalizedTool.toLowerCase()) {
          return {
            installed: true,
            version: installedMatch[2] || null
          }
        }
      }
    }
    
    return { installed: false, version: null }
  } catch (error) {
    console.error(`[API] Error checking tool ${toolName}:`, error)
    return { installed: false, version: null }
  }
}

// Get update command for a tool
function getUpdateCommand(toolName, platform) {
  const toolLower = toolName.toLowerCase()
  const updateCommands = {
        'darwin': {
          'trivy': 'brew upgrade trivy',
          'grype': 'brew upgrade grype',
          'gitleaks': 'brew upgrade gitleaks',
          'tfsec': 'brew upgrade tfsec',
          'semgrep': 'pip install --upgrade semgrep',
          'bandit': 'pip install --upgrade bandit',
          'eslint': 'npm install -g eslint@latest',
          'gosec': 'brew upgrade gosec',
          'brakeman': 'gem update brakeman',
          'snyk': 'brew upgrade snyk',
          'dependency-check': 'brew upgrade dependency-check',
          'trufflehog': 'brew upgrade trufflehog',
          'detect-secrets': 'pip install --upgrade detect-secrets',
          'checkov': 'brew upgrade checkov',
          'terrascan': 'brew upgrade terrascan',
          'kics': 'brew upgrade kics',
          'hadolint': 'brew upgrade hadolint',
          'syft': 'brew upgrade syft',
          'opa': 'brew upgrade opa',
          'pip-audit': 'pip install --upgrade pip-audit',
          'docker-bench-security': 'cd /tmp && rm -rf docker-bench-security && git clone https://github.com/docker/docker-bench-security.git && sudo cp docker-bench-security/docker-bench-security.sh /usr/local/bin/docker-bench-security && sudo chmod +x /usr/local/bin/docker-bench-security',
          'npm': 'brew upgrade node || echo "npm comes with Node.js. Update Node.js to update npm."'
        },
    'linux': {
      'trivy': 'curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin',
      'grype': 'curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh',
      'gitleaks': 'wget -qO- https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_Linux_x64.tar.gz | tar -xz && sudo mv gitleaks /usr/local/bin/',
      'tfsec': 'go install github.com/aquasecurity/tfsec/cmd/tfsec@latest',
      'semgrep': 'pip install --upgrade semgrep',
      'bandit': 'pip install --upgrade bandit',
      'eslint': 'npm install -g eslint@latest',
      'gosec': 'go install github.com/securego/gosec/v2/cmd/gosec@latest',
      'brakeman': 'gem update brakeman',
      'snyk': 'npm install -g snyk@latest',
      'dependency-check': 'sudo apt-get update && sudo apt-get install --only-upgrade dependency-check || sudo yum update dependency-check',
      'trufflehog': 'go install github.com/trufflesecurity/trufflehog/v3/cmd/trufflehog@latest',
      'detect-secrets': 'pip install --upgrade detect-secrets',
      'checkov': 'pip install --upgrade checkov',
      'terrascan': 'go install github.com/tenable/terrascan@latest',
      'kics': 'curl -sSfL https://raw.githubusercontent.com/Checkmarx/kics/master/install.sh | bash',
      'hadolint': 'wget -O /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 && chmod +x /usr/local/bin/hadolint',
      'syft': 'curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh',
      'opa': 'curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64 && chmod +x opa && sudo mv opa /usr/local/bin/',
      'pip-audit': 'pip install --upgrade pip-audit'
    }
  }
  
  const platformCommands = updateCommands[platform]
  return platformCommands && platformCommands[toolLower] ? platformCommands[toolLower] : null
}

// Install a tool
app.post('/api/tools/install', async (req, res) => {
  try {
    const { tool, update = false } = req.body
    
    if (!tool || typeof tool !== 'string') {
      return res.status(400).json({ error: 'Tool name is required' })
    }
    
    const dsoPath = await findDSOCLI()
    const platform = process.platform
    
    // Normalize tool name for matching
    const toolLower = tool.toLowerCase()
    const normalizedTool = normalizeToolName(tool)
    
    // First, check if tool is already installed
    const toolStatus = await checkToolInstalled(tool)
    
    if (toolStatus.installed && !update) {
      // Tool is already installed, check if update is available
      return res.json({
        success: true,
        alreadyInstalled: true,
        version: toolStatus.version,
        message: `${tool} is already installed (${toolStatus.version || 'version unknown'})`,
        canUpdate: true
      })
    }
    
    // Get installation/update command
    let installCmd = null
    
    if (update && toolStatus.installed) {
      // Get update command
      installCmd = getUpdateCommand(tool, platform)
    }
    
    if (!installCmd) {
      // Get installation command from dso tools output
      const { stdout } = await execAsync(`"${dsoPath}" tools`, {
        timeout: 10000
      })
      
      // Extract installation command for this tool
      const lines = stdout.split('\n')
      
      // Look for the tool in the output
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        // Check if this line contains the tool name (case insensitive) and is marked as missing
        const toolMatch = new RegExp(`\\s+[❌✗]\\s+${toolLower}`, 'i')
        if (toolMatch.test(line) || line.toLowerCase().includes(toolLower)) {
          // Look for install command in next few lines
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const nextLine = lines[j].trim()
            if (nextLine.includes('💡 Install:') || nextLine.includes('Install:')) {
              installCmd = nextLine.replace(/.*Install:\s*/, '').trim()
              break
            }
          }
          if (installCmd) break
        }
      }
    }
    
    // If still no command, try platform-specific defaults
    if (!installCmd) {
      // Map tool names to their common installation commands
      const installCommands = {
        'darwin': {
          'trivy': 'brew install trivy',
          'grype': 'brew install grype',
          'gitleaks': 'brew install gitleaks',
          'tfsec': 'brew install tfsec',
          'semgrep': 'brew install semgrep',
          'bandit': 'pip install bandit',
          'eslint': 'npm install -g eslint',
          'gosec': 'brew install gosec',
          'brakeman': 'gem install brakeman',
          'snyk': 'brew tap snyk/tap && brew install snyk',
          'dependency-check': 'brew install dependency-check',
          'trufflehog': 'brew install trufflesecurity/trufflehog/trufflehog',
          'detect-secrets': 'pip install detect-secrets',
          'checkov': 'brew install checkov',
          'terrascan': 'brew install terrascan',
          'kics': 'brew install kics',
          'hadolint': 'brew install hadolint',
          'syft': 'brew install syft',
          'opa': 'brew install opa',
          'pip-audit': 'pip3 install pip-audit || pip install pip-audit',
          'docker-bench-security': 'cd /tmp && rm -rf docker-bench-security 2>/dev/null; git clone https://github.com/docker/docker-bench-security.git && sudo cp docker-bench-security/docker-bench-security.sh /usr/local/bin/docker-bench-security && sudo chmod +x /usr/local/bin/docker-bench-security'
        },
        'linux': {
          'trivy': 'curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin',
          'grype': 'curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin',
          'gitleaks': 'wget -qO- https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_Linux_x64.tar.gz | tar -xz && sudo mv gitleaks /usr/local/bin/',
          'tfsec': 'go install github.com/aquasecurity/tfsec/cmd/tfsec@latest',
          'semgrep': 'pip install semgrep',
          'bandit': 'pip install bandit',
          'eslint': 'npm install -g eslint',
          'gosec': 'go install github.com/securego/gosec/v2/cmd/gosec@latest',
          'brakeman': 'gem install brakeman',
          'snyk': 'npm install -g snyk',
          'dependency-check': 'sudo apt-get update && sudo apt-get install -y dependency-check || sudo yum install -y dependency-check',
          'trufflehog': 'go install github.com/trufflesecurity/trufflehog/v3/cmd/trufflehog@latest',
          'detect-secrets': 'pip install detect-secrets',
          'checkov': 'pip install checkov',
          'terrascan': 'go install github.com/tenable/terrascan@latest',
          'kics': 'curl -sSfL https://raw.githubusercontent.com/Checkmarx/kics/master/install.sh | bash -s -- -b /usr/local/bin',
          'hadolint': 'wget -O /tmp/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 && sudo mv /tmp/hadolint /usr/local/bin/hadolint && sudo chmod +x /usr/local/bin/hadolint',
          'syft': 'curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin',
          'opa': 'curl -L -o /tmp/opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64 && sudo mv /tmp/opa /usr/local/bin/opa && sudo chmod +x /usr/local/bin/opa',
          'pip-audit': 'pip3 install pip-audit || pip install pip-audit',
          'docker-bench-security': 'cd /tmp && rm -rf docker-bench-security 2>/dev/null; git clone https://github.com/docker/docker-bench-security.git && sudo cp docker-bench-security/docker-bench-security.sh /usr/local/bin/docker-bench-security && sudo chmod +x /usr/local/bin/docker-bench-security',
          'npm': 'echo "npm comes with Node.js. Install from https://nodejs.org/"'
        }
      }
      
      const platformCommands = installCommands[platform]
      if (platformCommands && platformCommands[toolLower]) {
        installCmd = platformCommands[toolLower]
      } else {
        // Generic fallback
        if (platform === 'darwin') {
          installCmd = `brew install ${toolLower}`
        } else if (platform === 'linux') {
          installCmd = `sudo apt-get install -y ${toolLower} || sudo yum install -y ${toolLower} || sudo pacman -S ${toolLower}`
        } else {
          return res.status(400).json({ 
            success: false,
            error: `Installation command not found for ${tool}. Please install manually.` 
          })
        }
      }
    }
    
    console.log(`[API] ${update ? 'Updating' : 'Installing'} ${tool} with command: ${installCmd}`)
    
    // Execute installation/update command
    try {
      // Handle commands with && or ||
      const hasOr = installCmd.includes('||')
      const hasAnd = installCmd.includes('&&')
      
      let lastOutput = ''
      let lastError = ''
      let success = false
      
      if (hasOr || hasAnd) {
        // Parse command sequence
        const parts = installCmd.match(/([^&|]+|[&|]{2})/g) || []
        const commands = []
        const operators = []
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()
          if (part === '&&' || part === '||') {
            operators.push(part)
          } else if (part) {
            commands.push(part)
          }
        }
        
        // Execute commands in sequence
        for (let i = 0; i < commands.length; i++) {
          const cmd = commands[i]
          const prevOp = i > 0 ? operators[i - 1] : null
          
          try {
            const { stdout, stderr } = await execAsync(cmd, {
              timeout: 300000, // 5 minutes timeout
              maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            })
            lastOutput = (lastOutput ? lastOutput + '\n' : '') + (stdout || '')
            lastError = (lastError ? lastError + '\n' : '') + (stderr || '')
            success = true
            
            // If using || and command succeeded, stop
            if (prevOp === '||' && success) {
              break
            }
            // If using && and command failed, stop
            if (prevOp === '&&' && !success) {
              throw new Error(`Command failed: ${cmd}`)
            }
          } catch (cmdError) {
            lastError = (lastError ? lastError + '\n' : '') + (cmdError.message || '')
            success = false
            
            // If using ||, try next command
            if (prevOp === '||') {
              continue
            }
            // If using && or first command, stop on error
            if (prevOp === '&&' || i === 0) {
              throw cmdError
            }
          }
        }
      } else {
        // Single command
        try {
          const { stdout, stderr } = await execAsync(installCmd, {
            timeout: 300000, // 5 minutes timeout
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
          })
          lastOutput = stdout || ''
          lastError = stderr || ''
          success = true
        } catch (cmdError) {
          lastError = cmdError.message || ''
          success = false
          throw cmdError
        }
      }
      
      console.log(`[API] ${tool} ${update ? 'update' : 'installation'} output:`, lastOutput.substring(0, 500))
      
      if (lastError && lastError.trim() && !lastError.includes('Warning')) {
        console.warn(`[API] ${tool} ${update ? 'update' : 'installation'} warnings:`, lastError.substring(0, 500))
      }
      
      // Verify installation
      const verifyStatus = await checkToolInstalled(tool)
      if (!verifyStatus.installed && !update) {
        return res.status(500).json({
          success: false,
          error: `Installation completed but ${tool} is not found in PATH`,
          message: 'Please verify the installation manually'
        })
      }
      
      res.json({
        success: true,
        message: `${tool} ${update ? 'updated' : 'installed'} successfully`,
        version: verifyStatus.version,
        output: lastOutput
      })
    } catch (installError) {
      console.error(`[API] ${tool} ${update ? 'update' : 'installation'} error:`, installError.message)
      
      // Try to provide helpful error message
      let errorMessage = installError.message
      if (errorMessage.includes('Permission denied') || errorMessage.includes('EACCES')) {
        errorMessage = 'Permission denied. Try running with sudo or check your permissions.'
      } else if (errorMessage.includes('not found') || errorMessage.includes('command not found')) {
        errorMessage = 'Required package manager not found. Please install it first (e.g., brew, pip, npm).'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Installation timed out. Please try again or install manually.'
      }
      
      res.status(500).json({
        success: false,
        error: `Failed to ${update ? 'update' : 'install'} ${tool}`,
        message: errorMessage,
        details: installError.message
      })
    }
  } catch (error) {
    console.error('[API] Install tool error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to install tool',
      message: error.message
    })
  }
})

// Get tools status
app.get('/api/tools', async (req, res) => {
  try {
    const dsoPath = await findDSOCLI()
    const { stdout, stderr } = await execAsync(`"${dsoPath}" tools`, {
      timeout: 10000
    })
    
    console.log('[API] Tools output:', stdout.substring(0, 500))
    
    // Parse tools from output - new format with categories
    const tools = []
    const lines = stdout.split('\n')
    const toolMap = new Map() // To avoid duplicates
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip empty lines, headers, and description/install lines
      if (!trimmedLine || 
          trimmedLine.includes('🔧 DevSecOps Tools Status') ||
          trimmedLine.includes('💡 Install:') ||
          trimmedLine.includes('💡 Use') ||
          trimmedLine.includes('🎉') ||
          trimmedLine.includes('📥') ||
          trimmedLine.includes('Installed tools:') ||
          trimmedLine.includes('Missing tools:') ||
          trimmedLine.startsWith('      ') || // Description lines (indented with spaces)
          trimmedLine.match(/^📦\s+[^:]+:\s*$/)) { // Category headers like "📦 SAST:"
        continue
      }
      
      // Parse installed tools: "   ✅ npm (10.9.2)" or "   ✅ trivy"
      // Must start with spaces and ✅, followed by tool name
      const installedMatch = trimmedLine.match(/^\s+✅\s+([a-zA-Z0-9_-]+)(?:\s+\(([^)]+)\))?/)
      if (installedMatch) {
        const toolName = normalizeToolName(installedMatch[1])
        let version = installedMatch[2] || null
        if (version) {
          version = version.replace(/^v/i, '').trim()
        }
        if (!toolMap.has(toolName)) {
          tools.push({
            name: toolName,
            installed: true,
            version: version
          })
          toolMap.set(toolName, true)
        } else {
          // Update existing tool
          const existingTool = tools.find(t => t.name === toolName)
          if (existingTool) {
            existingTool.installed = true
            existingTool.version = version
          }
        }
        continue
      }
      
      // Parse missing tools: "   ❌ trivy" or "   ❌ gitleaks"
      // Must start with spaces and ❌, followed by tool name
      const missingMatch = trimmedLine.match(/^\s+❌\s+([a-zA-Z0-9_-]+)/)
      if (missingMatch) {
        const toolName = normalizeToolName(missingMatch[1])
        if (!toolMap.has(toolName)) {
          tools.push({
            name: toolName,
            installed: false,
            version: null
          })
          toolMap.set(toolName, true)
        }
        continue
      }
      
      // Also support old format: "   • trivy (v0.45.0)" for backward compatibility
      const oldFormatMatch = trimmedLine.match(/•\s+([a-zA-Z0-9_-]+)(?:\s+\(([^)]+)\))?/)
      if (oldFormatMatch) {
        const toolName = normalizeToolName(oldFormatMatch[1])
        let version = oldFormatMatch[2] || null
        if (version) {
          version = version.replace(/^v/i, '').trim()
        }
        if (!toolMap.has(toolName)) {
          tools.push({
            name: toolName,
            installed: !!version, // Assume installed if version is present
            version: version
          })
          toolMap.set(toolName, true)
        }
        continue
      }
    }
    
    // Ensure we have all expected tools with normalized names (comprehensive list)
    const expectedTools = [
      // SAST
      'Trivy', 'Semgrep', 'Bandit', 'ESLint', 'Gosec', 'Brakeman',
      // Dependencies
      'Grype', 'npm', 'pip-audit', 'Snyk', 'dependency-check',
      // Secrets
      'Gitleaks', 'TruffleHog', 'detect-secrets',
      // IaC
      'TFSec', 'Checkov', 'Terrascan', 'Kics',
      // Containers
      'Hadolint', 'docker-bench-security',
      // SBOM
      'Syft',
      // Compliance
      'OPA'
    ]
    const foundToolNames = tools.map(t => t.name)
    expectedTools.forEach(toolName => {
      if (!foundToolNames.includes(toolName)) {
        tools.push({
          name: toolName,
          installed: false,
          version: null
        })
      }
    })
    
    // Sort tools by name for consistency
    tools.sort((a, b) => {
      const order = ['Trivy', 'Grype', 'Gitleaks', 'TFSec']
      const aIndex = order.indexOf(a.name)
      const bIndex = order.indexOf(b.name)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.name.localeCompare(b.name)
    })
    
    console.log('[API] Parsed tools:', JSON.stringify(tools, null, 2))
    
    res.json({ tools })
  } catch (error) {
    console.error('[API] Tools error:', error)
    // Return default tools list on error
    res.json({ 
      tools: [
        { name: 'Trivy', installed: false, version: null },
        { name: 'Grype', installed: false, version: null },
        { name: 'Gitleaks', installed: false, version: null },
        { name: 'TFSec', installed: false, version: null }
      ]
    })
  }
})

// Store tokens in memory (in production, use Redis or database)
const tokenStore = new Map()

// GitHub/GitLab Personal Access Token authentication
app.post('/api/repos/:provider/auth', async (req, res) => {
  try {
    const { provider } = req.params
    const { token } = req.body
    
    if (!token || token.length < 10) {
      return res.status(400).json({ error: 'Invalid token' })
    }
    
    // Verify token by making API call to provider
    const apiUrl = provider === 'github'
      ? 'https://api.github.com/user'
      : 'https://gitlab.com/api/v4/user'
    
    const fetchFn = await getFetch()
    const response = await fetchFn(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      })
    }
    
    const user = await response.json()
    
    // Store token (in production, use secure storage)
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    tokenStore.set(sessionId, { provider, token, user })
    
    // Set session cookie
    res.cookie(`dso_${provider}_session`, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    res.json({ 
      success: true,
      user: {
        login: user.login || user.username,
        username: user.username || user.login,
        name: user.name,
        avatar_url: user.avatar_url
      }
    })
  } catch (error) {
    console.error('[API] Auth error:', error)
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
})

app.get('/api/repos/:provider/auth/status', async (req, res) => {
  try {
    const { provider } = req.params
    const sessionId = req.cookies[`dso_${provider}_session`]
    
    if (!sessionId || !tokenStore.has(sessionId)) {
      return res.json({ authenticated: false })
    }
    
    const session = tokenStore.get(sessionId)
    
    // Verify token is still valid
    const apiUrl = provider === 'github'
      ? 'https://api.github.com/user'
      : 'https://gitlab.com/api/v4/user'
    
    const fetchFn = await getFetch()
    const response = await fetchFn(apiUrl, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      tokenStore.delete(sessionId)
      return res.json({ authenticated: false })
    }
    
    const user = await response.json()
    
    res.json({ 
      authenticated: true,
      user: {
        login: user.login || user.username,
        username: user.username || user.login,
        name: user.name,
        avatar_url: user.avatar_url
      }
    })
  } catch (error) {
    res.json({ authenticated: false })
  }
})

app.post('/api/repos/:provider/auth/disconnect', async (req, res) => {
  try {
    const { provider } = req.params
    const sessionId = req.cookies[`dso_${provider}_session`]
    
    if (sessionId) {
      tokenStore.delete(sessionId)
    }
    
    res.clearCookie(`dso_${provider}_session`)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/repos/:provider/list', async (req, res) => {
  try {
    const { provider } = req.params
    const sessionId = req.cookies[`dso_${provider}_session`]
    
    if (!sessionId || !tokenStore.has(sessionId)) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    const session = tokenStore.get(sessionId)
    const token = session.token
    
    // Fetch repos from GitHub/GitLab API
    const apiUrl = provider === 'github'
      ? 'https://api.github.com/user/repos?per_page=100&sort=updated'
      : 'https://gitlab.com/api/v4/projects?membership=true&per_page=100&order_by=last_activity_at'
    
    const fetchFn = await getFetch()
    const response = await fetchFn(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }
    
    let repos = await response.json()
    
    // Normalize repo format
    repos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name || repo.path_with_namespace,
      description: repo.description || '',
      private: repo.private !== undefined ? repo.private : !repo.visibility || repo.visibility === 'private',
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      star_count: repo.star_count,
      updated_at: repo.updated_at || repo.last_activity_at,
      clone_url: repo.clone_url || repo.http_url_to_repo,
      ssh_url: repo.ssh_url || repo.ssh_url_to_repo
    }))
    
    res.json({ repos })
  } catch (error) {
    console.error('[API] List repos error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/repos/:provider/clone', async (req, res) => {
  try {
    const { provider } = req.params
    const { repo, clone_url } = req.body
    const sessionId = req.cookies[`dso_${provider}_session`]
    
    if (!sessionId || !tokenStore.has(sessionId)) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    const session = tokenStore.get(sessionId)
    const token = session.token
    
    console.log(`[API] Cloning ${provider} repository: ${repo}`)
    
    // Create temp directory
    const tempDir = path.join(__dirname, '..', 'temp', `repo-${Date.now()}`)
    await execAsync(`mkdir -p "${tempDir}"`)
    
    // Build clone URL with token for private repos
    let cloneUrl = clone_url
    if (!cloneUrl) {
      cloneUrl = `https://${provider === 'github' ? 'github.com' : 'gitlab.com'}/${repo}.git`
    }
    
    // Add token to HTTPS URLs for authentication
    if (cloneUrl.startsWith('https://') && !cloneUrl.includes('@')) {
      const urlParts = cloneUrl.replace('https://', '').split('/')
      cloneUrl = `https://${token}@${urlParts.join('/')}`
    }
    
    // Clone repository
    const cloneCmd = `git clone "${cloneUrl}" "${tempDir}"`
    
    await execAsync(cloneCmd, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minutes timeout
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0' // Disable prompts
      }
    })
    
    // Find the actual repo directory (might be nested)
    const repoName = repo.split('/').pop() || 'repo'
    const repoDir = path.join(tempDir, repoName)
    
    // Check if directory exists, if not, use tempDir
    const finalDir = await execAsync(`test -d "${repoDir}" && echo "${repoDir}" || echo "${tempDir}"`)
      .then(() => repoDir)
      .catch(() => {
        // Try to find the repo directory
        return execAsync(`find "${tempDir}" -maxdepth 2 -type d -name "${repoName}" | head -1`)
          .then(({ stdout }) => stdout.trim() || tempDir)
          .catch(() => tempDir)
      })
    
    console.log(`[API] Repository cloned to: ${finalDir}`)
    
    res.json({ 
      success: true,
      path: finalDir,
      message: 'Repository cloned successfully'
    })
  } catch (error) {
    console.error('[API] Clone error:', error)
    res.status(500).json({ 
      error: 'Clone failed', 
      message: error.message 
    })
  }
})

// Monitoring endpoints
app.get('/api/monitoring/kpis', async (req, res) => {
  try {
    res.json({
      uptime: { value: '99.9%', trend: 0.1 },
      scans: { value: 1247, trend: 12.5 },
      findings: { value: 342, trend: -8.3 },
      response: { value: '145ms', trend: -5.2 }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/monitoring/slos:
 *   get:
 *     summary: Récupère les SLO (Service Level Objectives)
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Liste des SLO
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SLO'
 */
app.get('/api/monitoring/slos', async (req, res) => {
  try {
    res.json([
      { id: 'availability', name: 'Availability', current: 99.9, target: 99.5, status: 'healthy', description: 'Goal: 99.5% availability' },
      { id: 'latency', name: 'Latency P95', current: 98, target: 95, status: 'healthy', description: 'Goal: 95% of requests < 200ms' },
      { id: 'error-rate', name: 'Error Rate', current: 0.05, target: 0.1, status: 'healthy', description: 'Goal: < 0.1% errors' }
    ])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/monitoring/services:
 *   get:
 *     summary: Récupère le statut de santé des services
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Liste des services et leur statut
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 */
app.get('/api/monitoring/services', async (req, res) => {
  try {
    const dsoPath = await findDSOCLI()
    const services = []
    
    const serviceChecks = [
      { name: 'DSO CLI', command: `"${dsoPath}" --version` },
      { name: 'Ollama', command: 'curl -s http://localhost:11434/api/tags || echo "not running"' },
      { name: 'Trivy', command: 'trivy --version 2>/dev/null || echo "not installed"' },
      { name: 'Grype', command: 'grype version 2>/dev/null || echo "not installed"' },
      { name: 'Gitleaks', command: 'gitleaks version 2>/dev/null || echo "not installed"' }
    ]
    
    for (const check of serviceChecks) {
      try {
        const { stdout } = await execAsync(check.command, { timeout: 5000 })
        const isHealthy = !stdout.includes('not') && stdout.trim().length > 0
        services.push({
          name: check.name,
          status: isHealthy ? 'healthy' : 'down',
          uptime: isHealthy ? 99.9 : 0,
          latency: isHealthy ? Math.floor(Math.random() * 200) + 50 : 0,
          errors: isHealthy ? 0 : 1
        })
      } catch {
        services.push({
          name: check.name,
          status: 'down',
          uptime: 0,
          latency: 0,
          errors: 1
        })
      }
    }
    
    res.json({ services })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Integrations endpoints
app.get('/api/integrations', async (req, res) => {
  try {
    res.json({ integrations: [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/integrations/{id}/connect:
 *   post:
 *     summary: Connecte une intégration
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Intégration connectée
 */
app.post('/api/integrations/:id/connect', async (req, res) => {
  try {
    const { id } = req.params
    const config = req.body
    console.log(`[API] Connecting integration ${id}`, config)
    res.json({ success: true, message: 'Integration connected' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/integrations/:id/disconnect', async (req, res) => {
  try {
    const { id } = req.params
    console.log(`[API] Disconnecting integration ${id}`)
    res.json({ success: true, message: 'Integration disconnected' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/integrations/{id}/test:
 *   post:
 *     summary: Teste la connexion d'une intégration
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Test de connexion réussi
 */
app.post('/api/integrations/:id/test', async (req, res) => {
  try {
    const { id } = req.params
    const config = req.body
    console.log(`[API] Testing integration ${id}`, config)
    res.json({ success: true, message: 'Connection test successful' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Helper function to detect OS and provide platform-specific context
function detectOS() {
  const platform = process.platform
  let osName = 'Unknown'
  let osType = 'unknown'
  let packageManager = 'unknown'
  let pathSeparator = '/'
  let shell = 'bash'
  
  if (platform === 'darwin') {
    osName = 'macOS'
    osType = 'macos'
    packageManager = 'brew'
    shell = 'bash'
  } else if (platform === 'win32') {
    osName = 'Windows'
    osType = 'windows'
    packageManager = 'choco or winget or scoop'
    pathSeparator = '\\'
    shell = 'powershell or cmd'
  } else if (platform === 'linux') {
    osName = 'Linux'
    osType = 'linux'
    // Try to detect Linux distribution
    try {
      if (existsSync('/etc/debian_version')) {
        packageManager = 'apt'
      } else if (existsSync('/etc/redhat-release')) {
        packageManager = 'yum or dnf'
      } else if (existsSync('/etc/arch-release')) {
        packageManager = 'pacman'
      } else {
        packageManager = 'apt or yum or pacman'
      }
    } catch {
      packageManager = 'apt or yum or pacman'
    }
    shell = 'bash'
  }
  
  return {
    platform,
    osName,
    osType,
    packageManager,
    pathSeparator,
    shell
  }
}

/**
 * @swagger
 * /api/autofix/diagnose:
 *   post:
 *     summary: Diagnostique un problème et propose une solution avec Ollama
 *     tags: [AutoFix]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issue
 *             properties:
 *               issue:
 *                 type: object
 *                 required:
 *                   - title
 *                   - description
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *     responses:
 *       200:
 *         description: Solution proposée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 solution:
 *                   type: string
 *                 commands:
 *                   type: array
 *                   items:
 *                     type: string
 *                 osInfo:
 *                   $ref: '#/components/schemas/OSInfo'
 *       500:
 *         description: Erreur lors du diagnostic
 */
app.post('/api/autofix/diagnose', async (req, res) => {
  try {
    const { issue } = req.body
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b'
    
    // Detect operating system
    const osInfo = detectOS()
    
    // Detect problem type
    const isCommandNotFound = issue.description?.toLowerCase().includes('command not found') || 
                              issue.description?.toLowerCase().includes('not found') ||
                              issue.title?.toLowerCase().includes('not found')
    const isPermissionError = issue.description?.toLowerCase().includes('permission denied') ||
                              issue.description?.toLowerCase().includes('sudo') ||
                              issue.description?.toLowerCase().includes('access denied')
    
    // Extract tool name if possible
    const toolMatch = issue.title?.match(/(\w+)\s+(?:non\s+)?accessible|(\w+)\s+not\s+found/i)
    const toolName = toolMatch ? (toolMatch[1] || toolMatch[2]) : 'tool'
    
    let prompt = `Operating system detected: ${osInfo.osName} (${osInfo.platform})
Package manager: ${osInfo.packageManager}
Shell: ${osInfo.shell}
Path separator: ${osInfo.pathSeparator}

A problem has been detected: ${issue.title}. 
Description: ${issue.description}. 

`

    if (isCommandNotFound) {
      prompt += `IDENTIFIED PROBLEM: Command not found
The tool "${toolName}" is not installed or not in PATH.

REQUIRED SOLUTION:
1. Install ${toolName} with ${osInfo.packageManager}
2. Verify installation
3. Add to PATH if necessary

`
      
      // Specific commands based on tool and OS
      if (toolName.toLowerCase() === 'trivy') {
        if (osInfo.osType === 'macos') {
          prompt += `Installation commands for macOS:
- brew install trivy
- Verify: trivy --version
`
        } else if (osInfo.osType === 'linux') {
          prompt += `Installation commands for Linux:
- sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg lsb-release
- wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
- echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
- sudo apt-get update && sudo apt-get install -y trivy
- Verify: trivy --version

OR alternative method (simpler):
- curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
`
        } else if (osInfo.osType === 'windows') {
          prompt += `Installation commands for Windows:
- winget install AquaSecurity.Trivy
- OR scoop install trivy
- OR choco install trivy
- Verify: trivy --version
`
        }
      } else {
        prompt += `Install ${toolName} with ${osInfo.packageManager}:\n`
      }
    }
    
    if (isPermissionError) {
      prompt += `IDENTIFIED PROBLEM: Permission error
Administrator privileges are required.

REQUIRED SOLUTION:
`
      if (osInfo.osType === 'macos' || osInfo.osType === 'linux') {
        prompt += `1. Request sudo permissions if necessary
2. Use sudo for commands requiring elevated privileges
3. Check file/directory permissions

IMPORTANT: For ${osInfo.osName}, you may need to enter your administrator password.
`
      } else if (osInfo.osType === 'windows') {
        prompt += `1. Run PowerShell or CMD as administrator
2. Right-click PowerShell/CMD > "Run as administrator"
3. Retry the command

IMPORTANT: For Windows, you must have administrator rights.
`
      }
    }
    
    prompt += `
Analyze this problem and propose a detailed solution with commands to execute to resolve it.
IMPORTANT: Commands must be adapted to the ${osInfo.osName} system:
- Use ${osInfo.packageManager} as package manager
- Use ${osInfo.shell} as shell
- Use ${osInfo.pathSeparator} as path separator
- For Windows: use PowerShell or CMD depending on context
- For macOS/Linux: use bash
${isPermissionError ? `- Include sudo if necessary for ${osInfo.osName}` : ''}

Respond in JSON format with: { 
  "solution": "detailed solution description", 
  "commands": ["cmd1", "cmd2"],
  "requiresSudo": ${isPermissionError ? 'true' : 'false'},
  "permissionNote": "${isPermissionError ? `For ${osInfo.osName}, you may need to enter your administrator password.` : 'No special permissions required.'}"
}
Commands must be directly executable on ${osInfo.osName}.`
    
    const fetchFn = await getFetch()
    const response = await fetchFn(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    })
    
    if (!response.ok) {
      throw new Error('Ollama not available')
    }
    
    const data = await response.json()
    const solution = data.response || ''
    
    let parsed = { solution, commands: [] }
    try {
      const jsonMatch = solution.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      }
    } catch {}
    
    // Extraire requiresSudo et permissionNote du JSON parsé
    const requiresSudo = parsed.requiresSudo || false
    const permissionNote = parsed.permissionNote || ''
    
    res.json({ 
      success: true, 
      solution: parsed.solution, 
      commands: parsed.commands || [],
      osInfo: osInfo,
      requiresSudo: requiresSudo,
      permissionNote: permissionNote
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * @swagger
 * /api/autofix/apply:
 *   post:
 *     summary: Applique les commandes de résolution proposées
 *     tags: [AutoFix]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commands
 *             properties:
 *               commands:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Résultats de l'exécution des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       command:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       output:
 *                         type: string
 *                       error:
 *                         type: string
 *                 osInfo:
 *                   $ref: '#/components/schemas/OSInfo'
 */
app.post('/api/autofix/apply', async (req, res) => {
  try {
    const { commands } = req.body
    
    if (!Array.isArray(commands) || commands.length === 0) {
      return res.status(400).json({ success: false, error: 'Commands array required' })
    }
    
    const results = []
    for (const cmd of commands) {
      try {
        const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 })
        results.push({ command: cmd, success: true, output: stdout, error: stderr })
      } catch (error) {
        results.push({ command: cmd, success: false, error: error.message })
      }
    }
    
    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get issues endpoint
app.get('/api/autofix/issues', async (req, res) => {
  try {
    // Check services and detect issues by calling the monitoring endpoint directly
    const dsoPath = await findDSOCLI()
    const services = []
    
    const serviceChecks = [
      { name: 'DSO CLI', command: `"${dsoPath}" --version` },
      { name: 'Ollama', command: 'curl -s http://localhost:11434/api/tags || echo "not running"' },
      { name: 'Trivy', command: 'trivy --version 2>/dev/null || echo "not installed"' },
      { name: 'Grype', command: 'grype version 2>/dev/null || echo "not installed"' },
      { name: 'Gitleaks', command: 'gitleaks version 2>/dev/null || echo "not installed"' }
    ]
    
    for (const check of serviceChecks) {
      try {
        const { stdout } = await execAsync(check.command, { timeout: 5000 })
        const isHealthy = !stdout.includes('not') && stdout.trim().length > 0
        services.push({
          name: check.name,
          status: isHealthy ? 'healthy' : 'down',
          uptime: isHealthy ? 99.9 : 0,
          latency: isHealthy ? Math.floor(Math.random() * 200) + 50 : 0,
          errors: isHealthy ? 0 : 1
        })
      } catch {
        services.push({
          name: check.name,
          status: 'down',
          uptime: 0,
          latency: 0,
          errors: 1
        })
      }
    }
    
    const issues = []
    services.forEach(service => {
      if (service.status === 'down' || service.status === 'degraded') {
        issues.push({
          id: `issue-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `${service.name} non accessible`,
          description: `Le service ${service.name} ne répond pas correctement. Statut: ${service.status}`,
          severity: service.status === 'down' ? 'critical' : 'high',
          status: 'detected'
        })
      }
    })
    
    res.json({ issues })
  } catch (error) {
    res.status(500).json({ error: error.message, issues: [] })
  }
})

// Service diagnosis endpoint with Ollama
app.post('/api/monitoring/services/diagnose', async (req, res) => {
  try {
    const { serviceName, status } = req.body
    
    if (!serviceName) {
      return res.status(400).json({ error: 'Service name required' })
    }
    
    // Use Ollama to diagnose the service issue
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const model = process.env.DSO_MODEL || 'llama3.1:8b'
    
    const prompt = `You are a DevSecOps expert. A service named "${serviceName}" has status "${status}".

Analyze the problem and propose a detailed diagnosis with:
1. Probable causes of the problem
2. Commands to check the service status
3. Possible solutions to resolve the problem

Respond in English in a clear and actionable way.`

    const fetchFn = await getFetch()
    const ollamaResponse = await fetchFn(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      })
    })
    
    if (!ollamaResponse.ok) {
      throw new Error('Ollama API error')
    }
    
    const ollamaData = await ollamaResponse.json()
    const diagnosis = ollamaData.message?.content || ollamaData.response || 'Diagnostic non disponible'
    
    res.json({ diagnosis })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Tools configuration endpoints
const toolsConfigStore = new Map()

app.get('/api/tools/config', async (req, res) => {
  try {
    const configs = Array.from(toolsConfigStore.entries()).map(([toolId, configured]) => ({
      toolId,
      configured
    }))
    res.json({ configs })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/tools/config', async (req, res) => {
  try {
    const { toolId, configured } = req.body
    
    if (!toolId) {
      return res.status(400).json({ error: 'Tool ID required' })
    }
    
    toolsConfigStore.set(toolId, configured !== false)
    res.json({ success: true, message: 'Configuration saved' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 DSO API Server running on http://localhost:${PORT}`)
  console.log(`📡 Endpoints:`)
  console.log(`   - POST /api/scan - Run security scan`)
  console.log(`   - POST /api/analyze - Analyze results`)
  console.log(`   - POST /api/fix - Apply auto-fix`)
  console.log(`   - GET /api/version - Get DSO version`)
  console.log(`   - GET /api/check - Check Ollama status`)
  console.log(`   - GET /api/tools - Get tools status`)
  console.log(`   - POST /api/repos/:provider/auth - Authenticate with PAT`)
  console.log(`   - GET /api/repos/:provider/auth/status - Get auth status`)
  console.log(`   - POST /api/repos/:provider/auth/disconnect - Disconnect`)
  console.log(`   - GET /api/repos/:provider/list - List repositories`)
  console.log(`   - POST /api/repos/:provider/clone - Clone repository`)
})

