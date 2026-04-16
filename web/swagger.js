import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DSO (DevSecOps Oracle) API',
      version: '0.1.0',
      description: 'Complete API for security analysis, monitoring, integrations, and automatic issue resolution',
      contact: {
        name: 'DSO Support',
        url: 'https://github.com/dso-cli/dso-cli'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.dso.dev',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Health', description: 'Health and status endpoints' },
      { name: 'Scan', description: 'Security scan execution and analysis' },
      { name: 'Analysis', description: 'AI analysis of scan results' },
      { name: 'Fix', description: 'Automatic fix application' },
      { name: 'Ollama', description: 'Ollama management and verification' },
      { name: 'Tools', description: 'DevSecOps tools management' },
      { name: 'Repositories', description: 'GitHub/GitLab repository management' },
      { name: 'Monitoring', description: 'Monitoring, KPI, and SLO endpoints' },
      { name: 'Integrations', description: 'External service integrations' },
      { name: 'AutoFix', description: 'Automatic issue resolution' }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            message: { type: 'string', description: 'Detailed description' }
          }
        },
        ScanResults: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                critical: { type: 'number' },
                high: { type: 'number' },
                medium: { type: 'number' },
                low: { type: 'number' },
                fixable: { type: 'number' },
                exploitable: { type: 'number' }
              }
            },
            findings: {
              type: 'array',
              items: { $ref: '#/components/schemas/Finding' }
            }
          }
        },
        Finding: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            file: { type: 'string' },
            line: { type: 'number' },
            severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
            tool: { type: 'string' },
            type: { type: 'string' },
            fixable: { type: 'boolean' },
            exploitable: { type: 'boolean' },
            cvss: { type: 'number' }
          }
        },
        AnalysisResult: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            businessImpact: { type: 'string' },
            topFixes: {
              type: 'array',
              items: { $ref: '#/components/schemas/TopFix' }
            }
          }
        },
        TopFix: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            file: { type: 'string' },
            line: { type: 'number' },
            command: { type: 'string' }
          }
        },
        OllamaStatus: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            model: { type: 'string' },
            url: { type: 'string' }
          }
        },
        ToolStatus: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            installed: { type: 'boolean' },
            version: { type: 'string' },
            category: { type: 'string' }
          }
        },
        KPI: {
          type: 'object',
          properties: {
            uptime: { type: 'object', properties: { value: { type: 'string' }, trend: { type: 'number' } } },
            scans: { type: 'object', properties: { value: { type: 'number' }, trend: { type: 'number' } } },
            findings: { type: 'object', properties: { value: { type: 'number' }, trend: { type: 'number' } } },
            response: { type: 'object', properties: { value: { type: 'string' }, trend: { type: 'number' } } }
          }
        },
        SLO: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            current: { type: 'number' },
            target: { type: 'number' },
            status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
            description: { type: 'string' }
          }
        },
        Service: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['healthy', 'degraded', 'down'] },
            uptime: { type: 'number' },
            latency: { type: 'number' },
            errors: { type: 'number' }
          }
        },
        OSInfo: {
          type: 'object',
          properties: {
            platform: { type: 'string' },
            osName: { type: 'string' },
            osType: { type: 'string' },
            packageManager: { type: 'string' },
            pathSeparator: { type: 'string' },
            shell: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./server.js'] // Path to files containing Swagger annotations
}

export const swaggerSpec = swaggerJsdoc(options)
export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DSO API Documentation'
}

export const swaggerUi = swaggerUiExpress

