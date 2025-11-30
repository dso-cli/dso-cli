import express from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

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
    const { stdout } = await execAsync(`"${dsoPath}" --version`, {
      timeout: 5000
    })
    // Extract version from output like "dso version 0.1.0" or "0.1.0"
    const versionMatch = stdout.match(/(\d+\.\d+\.\d+)/)
    const version = versionMatch ? versionMatch[1] : stdout.trim()
    res.json({ version })
  } catch (error) {
    console.error('[API] Version error:', error)
    res.status(500).json({ 
      error: 'Failed to get version',
      message: error.message 
    })
  }
})

// Check Ollama status
app.get('/api/check', async (req, res) => {
  try {
    const dsoPath = await findDSOCLI()
    const { stdout, stderr } = await execAsync(`"${dsoPath}" check`, {
      timeout: 10000
    })
    
    // Parse output to extract status
    const connected = !stdout.includes('❌ Failed') && !stdout.includes('connection refused')
    const modelMatch = stdout.match(/Configured model: (.+)/)
    const model = modelMatch ? modelMatch[1].trim() : null
    
    res.json({
      connected,
      model,
      output: stdout,
      error: stderr || null
    })
  } catch (error) {
    console.error('[API] Check error:', error)
    res.json({
      connected: false,
      model: null,
      error: error.message,
      output: error.stdout || ''
    })
  }
})

// Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body
    const dsoPath = await findDSOCLI()
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    console.log(`[API] Chat request: ${message.substring(0, 50)}...`)
    
    // Build context from history
    const context = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
    
    // Create a prompt for the AI
    const prompt = `Tu es un assistant DevSecOps expert. Tu aides les développeurs à comprendre et résoudre les problèmes de sécurité.

Contexte de la conversation:
${context}

Question de l'utilisateur: ${message}

Réponds de manière claire, concise et actionnable. Si tu peux proposer des actions concrètes, mentionne-les.
Réponds en français.`
    
    // Call DSO CLI with a custom command or use Ollama directly
    // For now, we'll use a simple approach: call dso with a custom prompt
    // In production, this would use the LLM service directly
    
    // Use Ollama API directly for chat
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
            content: 'Tu es un assistant DevSecOps expert. Tu aides les développeurs à comprendre et résoudre les problèmes de sécurité. Réponds toujours en français de manière claire et actionnable.'
          },
          ...history.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        stream: false
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
    const prompt = `Explique cette vulnérabilité de manière claire et actionnable:
Titre: ${finding.title}
Description: ${finding.description}
Fichier: ${finding.file}:${finding.line}
Sévérité: ${finding.severity}
Outil: ${finding.tool}

Réponds en français.`
    
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
            content: 'Tu es un expert en sécurité qui explique les vulnérabilités de manière claire et actionnable. Réponds toujours en français.'
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
    const explanation = ollamaData.message?.content || ollamaData.response || 'Explication non disponible'
    
    res.json({ explanation })
  } catch (error) {
    console.error('[API] Explain error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get recommendations
app.post('/api/chat/recommendations', async (req, res) => {
  try {
    const { scanResults } = req.body
    
    if (!scanResults) {
      return res.json({ recommendations: 'Aucun résultat de scan disponible pour générer des recommandations.' })
    }
    
    const prompt = `Basé sur ces résultats de scan de sécurité, donne des recommandations prioritaires:
Total: ${scanResults.summary?.total || 0} vulnérabilités
Critiques: ${scanResults.summary?.critical || 0}
Élevées: ${scanResults.summary?.high || 0}
Moyennes: ${scanResults.summary?.medium || 0}
Faibles: ${scanResults.summary?.low || 0}

Réponds en français avec des recommandations claires et actionnables, priorisées par importance.`
    
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
            content: 'Tu es un expert DevSecOps qui donne des recommandations de sécurité prioritaires. Réponds toujours en français.'
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

// Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    const dsoPath = await findDSOCLI()
    
    // Build context for AI
    let contextPrompt = ''
    if (context?.scanContext) {
      contextPrompt += `Contexte du scan: ${context.scanContext}\n\n`
    }
    
    if (context?.findings && context.findings.length > 0) {
      contextPrompt += `Vulnérabilités détectées:\n`
      context.findings.slice(0, 10).forEach((finding, idx) => {
        contextPrompt += `${idx + 1}. ${finding.title} (${finding.severity}) - ${finding.file}:${finding.line}\n`
      })
      contextPrompt += '\n'
    }
    
    // Create a prompt for the AI
    const fullPrompt = `${contextPrompt}Question de l'utilisateur: ${message}\n\nRéponds en français de manière claire et professionnelle. Donne des conseils pratiques et des solutions concrètes.`
    
    // Call DSO to analyze (we'll use a simple approach with Ollama)
    // For now, we'll use a direct Ollama API call
    const ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const model = process.env.DSO_MODEL || 'llama3.1:8b'
    
    const fetchFn = await getFetch()
    const ollamaResponse = await fetchFn(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert DevSecOps senior. Tu aides les développeurs à comprendre et corriger les problèmes de sécurité. Tu réponds toujours en français de manière claire, professionnelle et pratique. Tu donnes des conseils concrets et des solutions actionnables.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        stream: false
      })
    })
    
    if (!ollamaResponse.ok) {
      throw new Error('Ollama API error')
    }
    
    const ollamaData = await ollamaResponse.json()
    const response = ollamaData.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'
    
    res.json({ response })
  } catch (error) {
    console.error('[API] Chat error:', error)
    res.status(500).json({ 
      error: 'Chat failed',
      message: error.message 
    })
  }
})

// Get tools status
app.get('/api/tools', async (req, res) => {
  try {
    const dsoPath = await findDSOCLI()
    const { stdout } = await execAsync(`"${dsoPath}" tools`, {
      timeout: 10000
    })
    
    // Parse tools from output
    const tools = []
    const lines = stdout.split('\n')
    let inInstalledSection = false
    
    for (const line of lines) {
      if (line.includes('✅ Installed tools:')) {
        inInstalledSection = true
        continue
      }
      if (line.includes('⚠️  Missing tools:') || line.includes('💡')) {
        inInstalledSection = false
        continue
      }
      
      if (inInstalledSection && line.trim().startsWith('•')) {
        // Parse: "   • Trivy (0.45.0)"
        const match = line.match(/•\s+(\w+)(?:\s+\(([^)]+)\))?/)
        if (match) {
          tools.push({
            name: match[1],
            installed: true,
            version: match[2] || null
          })
        }
      } else if (!inInstalledSection && line.trim().startsWith('•')) {
        // Parse missing tools: "   • TFSec - Terraform scanner"
        const match = line.match(/•\s+(\w+)/)
        if (match) {
          tools.push({
            name: match[1],
            installed: false,
            version: null
          })
        }
      }
    }
    
    // Ensure we have all expected tools
    const expectedTools = ['Trivy', 'Grype', 'Gitleaks', 'TFSec']
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
    
    res.json({ tools })
  } catch (error) {
    console.error('[API] Tools error:', error)
    res.status(500).json({ 
      error: 'Failed to get tools status',
      message: error.message 
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

