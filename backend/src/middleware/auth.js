import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { createError } from './errorHandler.js'
import { getRedisClient } from '../utils/database.js'
import { logger } from '../utils/logger.js'

/**
 * JWT Authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError.unauthorized('Access token required')
    }

    const token = authHeader.substring(7)

    // Check if token is blacklisted (in Redis if available)
    const redisClient = getRedisClient()
    if (redisClient && redisClient.isOpen) {
      try {
        const isBlacklisted = await redisClient.exists(`blacklist:${token}`)
        if (isBlacklisted) {
          throw createError.unauthorized('Token has been revoked')
        }
      } catch (redisError) {
        logger.warn('Redis blacklist check failed:', redisError.message)
      }
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret)

    // Check if user still exists and is active
    const userCacheKey = `user:${decoded.walletAddress}`
    let user = null
    
    if (redisClient && redisClient.isOpen) {
      try {
        const cachedUser = await redisClient.get(userCacheKey)
        user = cachedUser ? JSON.parse(cachedUser) : null
      } catch (redisError) {
        logger.warn('Redis user lookup failed:', redisError.message)
      }
    }

    if (!user) {
      // If not in cache, this would normally fetch from database
      // For now, we'll use the decoded token data
      user = {
        walletAddress: decoded.walletAddress,
        role: decoded.role,
        name: decoded.name,
        isVerified: decoded.isVerified
      }
      
      // Cache user data for 1 hour (if Redis available)
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.setEx(userCacheKey, 3600, JSON.stringify(user))
        } catch (redisError) {
          logger.warn('Redis user caching failed:', redisError.message)
        }
      }
    }

    // Attach user info to request
    req.user = {
      walletAddress: user.walletAddress,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
      tokenId: decoded.jti // Token ID for revocation
    }

    // Log authentication
    logger.info('User authenticated', {
      walletAddress: user.walletAddress,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError.unauthorized('Invalid token'))
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError.unauthorized('Token expired'))
    }
    next(error)
  }
}

/**
 * Role-based authorization middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError.unauthorized('Authentication required'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.logSecurityEvent('Unauthorized access attempt', {
        walletAddress: req.user.walletAddress,
        role: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      })

      return next(createError.forbidden(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      ))
    }

    next()
  }
}

/**
 * Stakeholder verification middleware
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return next(createError.unauthorized('Authentication required'))
  }

  if (!req.user.isVerified) {
    logger.logSecurityEvent('Unverified stakeholder access attempt', {
      walletAddress: req.user.walletAddress,
      role: req.user.role,
      endpoint: req.originalUrl,
      ip: req.ip
    })

    return next(createError.forbidden(
      'Account verification required. Please contact an administrator.'
    ))
  }

  next()
}

/**
 * Optional authentication middleware
 * Authenticates user if token is provided, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // No token provided, continue without authentication
    }

    // Use the authenticate middleware
    await authenticate(req, res, next)
  } catch (error) {
    // If authentication fails, continue without user info
    req.user = null
    next()
  }
}

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn,
      issuer: 'pharmachain-api',
      audience: 'pharmachain-users',
      jwtid: generateTokenId() // Unique token ID for revocation
    }
  )
}

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'pharmachain-api',
      audience: 'pharmachain-users',
      jwtid: generateTokenId()
    }
  )
}

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret)
}

/**
 * Blacklist token (logout)
 */
export const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token)
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        const redisClient = getRedisClient()
        if (redisClient && redisClient.isOpen) {
          try {
            await redisClient.setEx(`blacklist:${token}`, ttl, 'true')
          } catch (redisError) {
            logger.warn('Redis token blacklisting failed:', redisError.message)
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error)
  }
}

/**
 * Generate unique token ID
 */
function generateTokenId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Extract token from request
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

/**
 * Middleware to log API access
 */
export const logAccess = (req, res, next) => {
  const startTime = Date.now()
  
  // Log request
  logger.info('API Access', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    user: req.user ? {
      walletAddress: req.user.walletAddress,
      role: req.user.role
    } : null
  })

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.logRequest(req, res, duration)
  })

  next()
}

export default {
  authenticate,
  authorize,
  requireVerification,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  blacklistToken,
  extractToken,
  logAccess
}