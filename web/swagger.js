import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DSO (DevSecOps Oracle) API',
      version: '0.1.0',
      description: 'API complète pour l\'analyse de sécurité, le monitoring, les intégrations et la résolution automatique de problèmes',
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
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.dso.dev',
        description: 'Serveur de production'
      }
    ],
    tags: [
      { name: 'Health', description: 'Endpoints de santé et statut' },
      { name: 'Scan', description: 'Exécution et analyse de scans de sécurité' },
      { name: 'Analysis', description: 'Analyse IA des résultats de scan' },
      { name: 'Fix', description: 'Application automatique de correctifs' },
      { name: 'Ollama', description: 'Gestion et vérification de Ollama' },
      { name: 'Tools', description: 'Gestion des outils DevSecOps' },
      { name: 'Repositories', description: 'Gestion des dépôts GitHub/GitLab' },
      { name: 'Monitoring', description: 'Monitoring, KPI et SLO' },
      { name: 'Integrations', description: 'Intégrations avec services externes' },
      { name: 'AutoFix', description: 'Résolution automatique de problèmes' }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Message d\'erreur' },
            message: { type: 'string', description: 'Description détaillée' }
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
  apis: ['./server.js'] // Chemin vers les fichiers contenant les annotations Swagger
}

export const swaggerSpec = swaggerJsdoc(options)
export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DSO API Documentation'
}

export const swaggerUi = swaggerUiExpress

