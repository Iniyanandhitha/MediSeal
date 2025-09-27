#!/usr/bin/env node

// PharmaChain Backend API Server Entry Point
import { startServer } from './src/app.js'
import { logger } from './src/utils/logger.js'

// Set process title
process.title = 'pharmachain-api'

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason })
  process.exit(1)
})

// Start the server
logger.info('Starting PharmaChain API Server...')
startServer()