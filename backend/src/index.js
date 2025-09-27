import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { initializeDatabases } from './utils/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { setupSwagger } from './config/swagger.js'

// Import routes
import authRoutes from './routes/auth.js'
import batchRoutes from './routes/batch.js'
import stakeholderRoutes from './routes/stakeholder.js'
import ipfsRoutes from './routes/ipfs.js'
import qrRoutes from './routes/qr.js'
import aiRoutes from './routes/ai.js'
import healthRoutes from './routes/health.js'

/**
 * PharmaChain Backend API Server
 * Main application entry point
 */
class PharmaChainAPI {
  constructor() {
    this.app = express()
    this.port = config.port
  }

  /**
   * Initialize middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // CORS configuration
    this.app.use(cors({
      origin: config.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }))

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindow * 60 * 1000, // Convert to milliseconds
      max: config.rateLimitMaxRequests,
      message: {
        error: 'Too many requests from this IP',
        retryAfter: config.rateLimitWindow * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
    this.app.use('/api/', limiter)

    // Compression
    this.app.use(compression())

    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim())
        }
      }))
    }

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    // Trust proxy (for deployment behind reverse proxy)
    this.app.set('trust proxy', 1)
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check (before rate limiting)
    this.app.use('/health', healthRoutes)

    // API routes
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/batches', batchRoutes)
    this.app.use('/api/stakeholders', stakeholderRoutes)
    this.app.use('/api/ipfs', ipfsRoutes)
    this.app.use('/api/qr', qrRoutes)
    this.app.use('/api/ai', aiRoutes)

    // API documentation
    setupSwagger(this.app)

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'PharmaChain Backend API',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          docs: '/api-docs',
          auth: '/api/auth',
          batches: '/api/batches',
          stakeholders: '/api/stakeholders',
          ipfs: '/api/ipfs',
          qr: '/api/qr',
          ai: '/api/ai'
        }
      })
    })
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler)

    // Global error handler
    this.app.use(errorHandler)
  }

  /**
   * Initialize database connections
   */
  async initializeDatabase() {
    try {
      const results = await initializeDatabases()
      
      if (results.mongodb) {
        logger.info('MongoDB connection initialized')
      }
      
      if (results.redis) {
        logger.info('Redis connection initialized')
      }
      
      logger.info('Database connections initialized successfully')
    } catch (error) {
      logger.error('Database initialization failed:', error)
      // Don't throw error - app can continue without databases
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Initialize database connections
      await this.initializeDatabase()

      // Setup middleware
      this.setupMiddleware()

      // Setup routes
      this.setupRoutes()

      // Setup error handling
      this.setupErrorHandling()

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 PharmaChain Backend API started successfully`)
        logger.info(`📡 Server running on port ${this.port}`)
        logger.info(`🌍 Environment: ${config.nodeEnv}`)
        logger.info(`📋 Health check: http://localhost:${this.port}/health`)
        logger.info(`📚 API docs: http://localhost:${this.port}/api-docs`)
        logger.info(`🔗 API base URL: http://localhost:${this.port}/api`)
      })

      // Handle graceful shutdown
      this.setupGracefulShutdown()

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)

      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed')

          try {
            // Close database connections
            const mongoose = await import('mongoose')
            await mongoose.default.connection.close()
            logger.info('MongoDB connection closed')

            // Close Redis connection if exists
            // Redis cleanup will be handled by the redis client

            logger.info('Graceful shutdown completed')
            process.exit(0)
          } catch (error) {
            logger.error('Error during shutdown:', error)
            process.exit(1)
          }
        })
      } else {
        process.exit(0)
      }
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  }
}

// Create and start the application
const app = new PharmaChainAPI()

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.start().catch((error) => {
    logger.error('Application startup failed:', error)
    process.exit(1)
  })
}

export default app