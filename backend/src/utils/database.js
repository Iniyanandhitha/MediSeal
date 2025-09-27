import mongoose from 'mongoose'
import { createClient } from 'redis'
import { config } from '../config/index.js'
import { logger } from './logger.js'

// MongoDB connection
let mongoConnection = null

/**
 * Connect to MongoDB database
 */
export async function connectMongoDB() {
  try {
    if (mongoConnection && mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected')
      return mongoConnection
    }

    logger.info('Connecting to MongoDB...', { uri: config.database.mongodb.uri.replace(/\/\/.*@/, '//***:***@') })

    mongoose.set('strictQuery', false)

    const connection = await mongoose.connect(config.database.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    mongoConnection = connection

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully')
    })

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        logger.info('MongoDB connection closed due to app termination')
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error)
      }
    })

    return connection
  } catch (error) {
    logger.warn('Failed to connect to MongoDB (continuing without database):', error.message)
    return null
  }
}

// Redis connection
let redisClient = null

/**
 * Connect to Redis cache
 */
export async function connectRedis() {
  try {
    if (redisClient && redisClient.isOpen) {
      logger.info('Redis already connected')
      return redisClient
    }

    logger.info('Connecting to Redis...', { url: config.database.redis.url.replace(/\/\/.*@/, '//***:***@') })

    redisClient = createClient({
      url: config.database.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries >= 3) {
            logger.warn('Redis max reconnection attempts reached, giving up')
            return false // Stop retrying
          }
          return Math.min(retries * 1000, 3000)
        }
      }
    })

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connecting')
    })

    redisClient.on('ready', () => {
      logger.info('Redis connected successfully')
    })

    redisClient.on('error', (error) => {
      logger.warn('Redis connection error (continuing without cache):', error.message)
    })

    redisClient.on('end', () => {
      logger.warn('Redis connection ended')
    })

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting')
    })

    // Try to connect with timeout
    const connectTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    })

    await Promise.race([
      redisClient.connect(),
      connectTimeout
    ])

    // Test the connection
    await redisClient.ping()
    logger.info('Redis ping successful')

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        if (redisClient?.isOpen) {
          await redisClient.disconnect()
          logger.info('Redis connection closed due to app termination')
        }
      } catch (error) {
        logger.error('Error closing Redis connection:', error)
      }
    })

    return redisClient
  } catch (error) {
    logger.warn('Failed to connect to Redis (continuing without cache):', error.message)
    if (redisClient) {
      try {
        await redisClient.disconnect()
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
      redisClient = null
    }
    return null
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  return redisClient
}

/**
 * Get MongoDB connection instance
 */
export function getMongoConnection() {
  return mongoConnection
}

/**
 * Check database health
 */
export async function checkDatabaseHealth() {
  const health = {
    mongodb: {
      status: 'disconnected',
      readyState: 0,
      error: null
    },
    redis: {
      status: 'disconnected',
      isOpen: false,
      error: null
    }
  }

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      // Test with a simple ping
      await mongoose.connection.db.admin().ping()
      health.mongodb = {
        status: 'connected',
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        error: null
      }
    } else {
      health.mongodb.readyState = mongoose.connection.readyState
    }
  } catch (error) {
    health.mongodb.error = error.message
  }

  // Check Redis
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping()
      health.redis = {
        status: 'connected',
        isOpen: true,
        error: null
      }
    }
  } catch (error) {
    health.redis.error = error.message
  }

  return health
}

/**
 * Initialize all database connections
 */
export async function initializeDatabases() {
  const results = {}

  try {
    results.mongodb = await connectMongoDB()
    logger.info('MongoDB initialization completed')
  } catch (error) {
    logger.error('MongoDB initialization failed:', error)
    results.mongodb = { error }
  }

  try {
    results.redis = await connectRedis()
    if (results.redis) {
      logger.info('Redis initialization completed')
    }
  } catch (error) {
    logger.error('Redis initialization failed:', error)
    results.redis = { error }
  }

  return results
}

export default {
  connectMongoDB,
  connectRedis,
  getRedisClient,
  getMongoConnection,
  checkDatabaseHealth,
  initializeDatabases
}