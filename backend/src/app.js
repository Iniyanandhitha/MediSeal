import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { errorHandler as globalErrorHandler } from './middleware/errorHandler.js'
import { connectMongoDB, connectRedis } from './utils/database.js'

// Import routes
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import batchRoutes from './routes/batches.js'
import stakeholderRoutes from './routes/stakeholders.js'
import laboratoryRoutes from './routes/laboratory.js'

const app = express()

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediSeal API',
      version: '1.0.0',
      description: 'Pharmaceutical Supply Chain Management API with Blockchain Integration',
      contact: {
        name: 'MediSeal Team',
        email: 'support@mediseal.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server?.port || config.port || 3002}`,
        description: 'MediSeal API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization header using the Bearer scheme'
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
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                details: {
                  type: 'object'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SuccessResponse: {
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
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'System health and monitoring endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Batches',
        description: 'Pharmaceutical batch management'
      },
      {
        name: 'Laboratory',
        description: 'Laboratory testing and certification'
      },
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
}

const specs = swaggerJsdoc(swaggerOptions)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}))

// CORS configuration
app.use(cors({
  origin: config.allowedOrigins || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: (config.rateLimitWindow || 15) * 60 * 1000, // Convert minutes to milliseconds
  max: config.rateLimitMaxRequests || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Simple request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })
  
  next()
}

// Request logging
app.use(requestLogger)

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MediSeal API Documentation'
}))

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'MediSeal API',
      version: '1.0.0',
      description: 'Pharmaceutical Supply Chain Management with Blockchain',
      documentation: '/api-docs',
      health: '/api/health',
      timestamp: new Date().toISOString()
    },
    message: 'Welcome to MediSeal API'
  })
})

// API Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/stakeholders', stakeholderRoutes)
app.use('/api/laboratory', laboratoryRoutes)

// QR Code verification endpoint (public)
app.get('/verify/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params
    
    // Simple verification page - in production this would be a proper frontend
    res.json({
      success: true,
      data: {
        tokenId,
        verificationUrl: `http://localhost:${config.port}/api/batches/${tokenId}`,
        qrCodeUrl: `http://localhost:${config.port}/api/batches/${tokenId}/qr`,
        message: 'Use the API endpoints with proper authentication to get detailed batch information'
      },
      message: 'Batch verification endpoint'
    })
  } catch (error) {
    logger.error('Verification endpoint error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Failed to process verification request'
      }
    })
  }
})

// Stakeholder verification endpoint (public)
app.get('/verify/stakeholder/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params
    
    res.json({
      success: true,
      data: {
        walletAddress,
        verificationUrl: `http://localhost:${config.port}/api/stakeholders/${walletAddress}`,
        qrCodeUrl: `http://localhost:${config.port}/api/stakeholders/${walletAddress}/qr`,
        message: 'Use the API endpoints with proper authentication to get detailed stakeholder information'
      },
      message: 'Stakeholder verification endpoint'
    })
  } catch (error) {
    logger.error('Stakeholder verification endpoint error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Failed to process stakeholder verification request'
      }
    })
  }
})

// 404 handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    },
    timestamp: new Date().toISOString()
  })
}

// 404 handler
app.use(notFoundHandler)

// Global error handler
app.use(globalErrorHandler)

// Initialize database connections
async function initializeDatabase() {
  try {
    await connectMongoDB()
    await connectRedis()
    logger.info('All database connections initialized successfully')
  } catch (error) {
    logger.warn('Database initialization failed, continuing without databases:', error.message)
    // Continue without databases for development
  }
}

// Start server
async function startServer() {
  try {
    // Initialize databases
    await initializeDatabase()
    
    // Start listening
    const server = app.listen(config.port, 'localhost', () => {
      logger.info(`🚀 MediSeal API Server running`, {
        port: config.port,
        host: 'localhost',
        env: config.nodeEnv,
        documentation: `http://localhost:${config.port}/api-docs`,
        health: `http://localhost:${config.port}/api/health`
      })
    })

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)
      
      server.close(() => {
        logger.info('HTTP server closed')
        
        // Close database connections
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    return server
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    logger.error('Startup error:', error)
    process.exit(1)
  })
}

export { app, startServer }
export default app