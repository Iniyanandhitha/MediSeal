import winston from 'winston'
import { config } from '../config/index.js'

/**
 * Logger configuration using Winston
 */

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
  })
)

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create transports array
const transports = []

// Console transport (always enabled in development)
if (config.logging.enableConsole || config.isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level
    })
  )
}

// File transport (if enabled)
if (config.logging.enableFile) {
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      format: fileFormat,
      level: config.logging.level,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  exitOnError: false,
})

// Add request logging helper
logger.logRequest = (req, res, responseTime) => {
  const { method, url, ip } = req
  const { statusCode } = res
  const userAgent = req.get('User-Agent') || 'Unknown'
  
  const logData = {
    method,
    url,
    ip,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent,
    timestamp: new Date().toISOString()
  }

  if (statusCode >= 400) {
    logger.warn('HTTP Request', logData)
  } else {
    logger.info('HTTP Request', logData)
  }
}

// Add blockchain transaction logging
logger.logBlockchainTransaction = (action, data) => {
  logger.info('Blockchain Transaction', {
    action,
    ...data,
    timestamp: new Date().toISOString()
  })
}

// Add IPFS operation logging
logger.logIPFSOperation = (operation, data) => {
  logger.info('IPFS Operation', {
    operation,
    ...data,
    timestamp: new Date().toISOString()
  })
}

// Add security event logging
logger.logSecurityEvent = (event, data) => {
  logger.warn('Security Event', {
    event,
    ...data,
    timestamp: new Date().toISOString()
  })
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

export default logger