import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { config } from './index.js'

/**
 * Swagger configuration for API documentation
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PharmaChain Backend API',
      version: config.api.version,
      description: `
        PharmaChain Backend API provides comprehensive endpoints for managing pharmaceutical supply chain operations using blockchain technology, IPFS storage, and AI-powered authenticity verification.
        
        ## Features
        - **Blockchain Integration**: NFT-based batch tracking on Ethereum
        - **Decentralized Storage**: IPFS integration for packaging images and metadata
        - **AI Authenticity**: Computer vision for package authenticity detection
        - **Role-based Access**: Multi-stakeholder authentication system
        - **QR Code Verification**: Physical-digital product linking
        
        ## Authentication
        Most endpoints require JWT token authentication. Include the token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Rate Limiting
        API requests are rate limited to ${config.security.rateLimitMaxRequests} requests per ${config.security.rateLimitWindow} minutes per IP address.
      `,
      contact: {
        name: 'PharmaChain Team',
        email: 'support@pharmachain.io'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.prefix}`,
        description: 'Development server'
      },
      {
        url: 'https://api.pharmachain.io/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        StakeholderRole: {
          type: 'string',
          enum: ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'HEALTHCARE_PROVIDER', 'REGULATOR'],
          description: 'Role of the stakeholder in the supply chain'
        },
        BatchStatus: {
          type: 'string',
          enum: ['MANUFACTURED', 'IN_TRANSIT', 'DELIVERED', 'DISPENSED', 'RECALLED'],
          description: 'Current status of the pharmaceutical batch'
        },
        Stakeholder: {
          type: 'object',
          properties: {
            walletAddress: {
              type: 'string',
              example: '0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc'
            },
            name: {
              type: 'string',
              example: 'Pharma Corp Manufacturing'
            },
            licenseNumber: {
              type: 'string',
              example: 'MFG-001'
            },
            role: {
              $ref: '#/components/schemas/StakeholderRole'
            },
            isVerified: {
              type: 'boolean',
              example: true
            },
            registrationDate: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['walletAddress', 'name', 'licenseNumber', 'role']
        },
        Batch: {
          type: 'object',
          properties: {
            tokenId: {
              type: 'integer',
              example: 1
            },
            drugName: {
              type: 'string',
              example: 'Amoxicillin 500mg'
            },
            batchNumber: {
              type: 'string',
              example: 'BATCH-2024-001'
            },
            manufacturingDate: {
              type: 'string',
              format: 'date-time'
            },
            expiryDate: {
              type: 'string',
              format: 'date-time'
            },
            manufacturer: {
              type: 'string',
              example: '0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc'
            },
            ipfsHash: {
              type: 'string',
              example: 'bafkreiezvaltuqlz6m65f6zcphtkaj66wfeibvpuwmzbyqifxshne6djem'
            },
            status: {
              $ref: '#/components/schemas/BatchStatus'
            },
            quantity: {
              type: 'integer',
              example: 1000
            },
            qrCodeHash: {
              type: 'string',
              example: 'sha256_hash_of_qr_code'
            }
          },
          required: ['drugName', 'batchNumber', 'manufacturingDate', 'expiryDate', 'quantity']
        },
        QRCode: {
          type: 'object',
          properties: {
            batchId: {
              type: 'integer',
              example: 1
            },
            qrCodeData: {
              type: 'string',
              description: 'Base64 encoded QR code image'
            },
            qrCodeHash: {
              type: 'string',
              example: 'sha256_hash_of_qr_code'
            },
            verificationUrl: {
              type: 'string',
              example: 'https://verify.pharmachain.io/batch/1'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Batches',
        description: 'Pharmaceutical batch management and tracking'
      },
      {
        name: 'Stakeholders',
        description: 'Supply chain stakeholder management'
      },
      {
        name: 'IPFS',
        description: 'Decentralized file storage operations'
      },
      {
        name: 'QR Codes',
        description: 'QR code generation and verification'
      },
      {
        name: 'AI Analysis',
        description: 'AI-powered package authenticity verification'
      },
      {
        name: 'Health',
        description: 'System health and status monitoring'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
}

const specs = swaggerJsdoc(options)

/**
 * Setup Swagger documentation
 */
export function setupSwagger(app) {
  const swaggerOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #2c5aa0; }
    `,
    customSiteTitle: 'PharmaChain API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions))
  
  // Serve the swagger.json file
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })
}

export { specs as swaggerSpecs }
export default { setupSwagger, swaggerSpecs: specs }