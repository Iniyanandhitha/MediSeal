import { logger } from '../utils/logger.js'

/**
 * Global error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'
  let code = error.code || 'INTERNAL_ERROR'

  // Log the error
  logger.error('API Error:', {
    error: message,
    code,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  })

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    code = 'VALIDATION_ERROR'
  }

  if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
    code = 'INVALID_ID'
  }

  if (error.code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
    code = 'DUPLICATE_ERROR'
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    code = 'INVALID_TOKEN'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    code = 'TOKEN_EXPIRED'
  }

  // Blockchain-specific errors
  if (error.message?.includes('execution reverted')) {
    statusCode = 400
    message = 'Blockchain transaction failed'
    code = 'BLOCKCHAIN_ERROR'
  }

  if (error.message?.includes('insufficient funds')) {
    statusCode = 400
    message = 'Insufficient funds for transaction'
    code = 'INSUFFICIENT_FUNDS'
  }

  // IPFS-specific errors
  if (error.message?.includes('IPFS')) {
    statusCode = 503
    message = 'IPFS service unavailable'
    code = 'IPFS_ERROR'
  }

  // Rate limiting errors
  if (error.statusCode === 429) {
    statusCode = 429
    message = 'Too many requests'
    code = 'RATE_LIMIT_EXCEEDED'
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error'
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.details 
    })
  })
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Common error creators
 */
export const createError = {
  badRequest: (message = 'Bad Request', code = 'BAD_REQUEST') => 
    new AppError(message, 400, code),
    
  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED') => 
    new AppError(message, 401, code),
    
  forbidden: (message = 'Forbidden', code = 'FORBIDDEN') => 
    new AppError(message, 403, code),
    
  notFound: (message = 'Not Found', code = 'NOT_FOUND') => 
    new AppError(message, 404, code),
    
  conflict: (message = 'Conflict', code = 'CONFLICT') => 
    new AppError(message, 409, code),
    
  unprocessable: (message = 'Unprocessable Entity', code = 'UNPROCESSABLE') => 
    new AppError(message, 422, code),
    
  tooManyRequests: (message = 'Too Many Requests', code = 'RATE_LIMIT') => 
    new AppError(message, 429, code),
    
  internal: (message = 'Internal Server Error', code = 'INTERNAL_ERROR') => 
    new AppError(message, 500, code),
    
  serviceUnavailable: (message = 'Service Unavailable', code = 'SERVICE_UNAVAILABLE') => 
    new AppError(message, 503, code),

  // Blockchain-specific errors
  blockchainError: (message = 'Blockchain transaction failed', code = 'BLOCKCHAIN_ERROR') => 
    new AppError(message, 400, code),

  insufficientFunds: (message = 'Insufficient funds', code = 'INSUFFICIENT_FUNDS') => 
    new AppError(message, 400, code),

  // IPFS-specific errors
  ipfsError: (message = 'IPFS operation failed', code = 'IPFS_ERROR') => 
    new AppError(message, 503, code),

  // Authentication-specific errors
  invalidCredentials: (message = 'Invalid credentials', code = 'INVALID_CREDENTIALS') => 
    new AppError(message, 401, code),

  tokenExpired: (message = 'Token expired', code = 'TOKEN_EXPIRED') => 
    new AppError(message, 401, code),

  // Validation errors
  validationError: (message = 'Validation failed', code = 'VALIDATION_ERROR') => 
    new AppError(message, 400, code),

  // Business logic errors
  stakeholderNotFound: (message = 'Stakeholder not found', code = 'STAKEHOLDER_NOT_FOUND') => 
    new AppError(message, 404, code),

  batchNotFound: (message = 'Batch not found', code = 'BATCH_NOT_FOUND') => 
    new AppError(message, 404, code),

  unauthorized: (message = 'Access denied', code = 'ACCESS_DENIED') => 
    new AppError(message, 403, code),

  batchAlreadyExists: (message = 'Batch already exists', code = 'BATCH_EXISTS') => 
    new AppError(message, 409, code),

  invalidQRCode: (message = 'Invalid QR code', code = 'INVALID_QR_CODE') => 
    new AppError(message, 400, code),

  batchRecalled: (message = 'Batch has been recalled', code = 'BATCH_RECALLED') => 
    new AppError(message, 400, code),

  transferNotAllowed: (message = 'Transfer not allowed', code = 'TRANSFER_NOT_ALLOWED') => 
    new AppError(message, 403, code)
}

export default errorHandler