import express from 'express'
import { checkDatabaseHealth, getRedisClient } from '../utils/database.js'
import blockchainService from '../services/blockchain.js'
import ipfsService from '../services/ipfs.js'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'

const router = express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of all system components
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *                     blockchain:
 *                       type: object
 *                     ipfs:
 *                       type: object
 */
router.get('/', async (req, res) => {
  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.api.version,
    environment: config.nodeEnv,
    uptime: process.uptime(),
    services: {}
  }

  // Check Database
  try {
    const dbHealth = await checkDatabaseHealth()
    healthCheck.services.database = {
      status: dbHealth.mongodb.status === 'connected' ? 'healthy' : 'unhealthy',
      state: dbHealth.mongodb.status,
      host: dbHealth.mongodb.host,
      name: dbHealth.mongodb.name
    }
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message
    }
    healthCheck.status = 'unhealthy'
  }

  // Check Redis
  try {
    const redisClient = getRedisClient()
    if (redisClient) {
      await redisClient.ping()
      healthCheck.services.redis = {
        status: 'healthy',
        connected: true
      }
    } else {
      healthCheck.services.redis = {
        status: 'unavailable',
        connected: false,
        note: 'Redis not configured or disabled'
      }
    }
  } catch (error) {
    healthCheck.services.redis = {
      status: 'unhealthy',
      error: error.message
    }
    healthCheck.status = 'degraded'
  }

  // Check Blockchain
  try {
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }
    
    const balance = await blockchainService.getBalance()
    const gasPrice = await blockchainService.getGasPrice()
    
    healthCheck.services.blockchain = {
      status: 'healthy',
      network: config.blockchain.network,
      contractAddress: config.blockchain.contractAddress,
      walletBalance: balance + ' ETH',
      gasPrice: gasPrice + ' wei'
    }
  } catch (error) {
    healthCheck.services.blockchain = {
      status: 'unhealthy',
      error: error.message
    }
    healthCheck.status = 'unhealthy'
  }

  // Check IPFS
  try {
    const ipfsHealth = await ipfsService.healthCheck()
    healthCheck.services.ipfs = {
      status: ipfsHealth.isHealthy ? 'healthy' : 'unhealthy',
      apiUrl: ipfsHealth.apiUrl,
      responseTime: ipfsHealth.responseTime,
      error: ipfsHealth.error
    }
    
    if (!ipfsHealth.isHealthy) {
      healthCheck.status = 'degraded'
    }
  } catch (error) {
    healthCheck.services.ipfs = {
      status: 'unhealthy',
      error: error.message
    }
    healthCheck.status = 'degraded'
  }

  // Add response time
  healthCheck.responseTime = `${Date.now() - startTime}ms`

  // Add system info
  healthCheck.system = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    cpuUsage: process.cpuUsage()
  }

  // Determine overall status
  const serviceStatuses = Object.values(healthCheck.services).map(s => s.status)
  if (serviceStatuses.includes('unhealthy')) {
    healthCheck.status = 'unhealthy'
  } else if (serviceStatuses.includes('degraded')) {
    healthCheck.status = 'degraded'
  }

  // Set appropriate HTTP status code
  const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503

  logger.info('Health check completed:', {
    status: healthCheck.status,
    responseTime: healthCheck.responseTime,
    services: Object.keys(healthCheck.services).reduce((acc, key) => {
      acc[key] = healthCheck.services[key].status
      return acc
    }, {})
  })

  res.status(httpStatus).json(healthCheck)
})

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health information including service-specific metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed system health information
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now()
  const detailedHealth = {
    timestamp: new Date().toISOString(),
    services: {}
  }

  // Detailed Database Check
  try {
    const dbHealth = await checkDatabaseHealth()
    detailedHealth.services.database = {
      status: dbHealth.mongodb.status === 'connected' ? 'healthy' : 'unhealthy',
      details: dbHealth
    }
  } catch (error) {
    detailedHealth.services.database = {
      status: 'unhealthy',
      error: error.message
    }
  }

  // Detailed Blockchain Check
  try {
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    const balance = await blockchainService.getBalance()
    const gasPrice = await blockchainService.getGasPrice()
    
    detailedHealth.services.blockchain = {
      status: 'healthy',
      details: {
        network: config.blockchain.network,
        rpcUrl: config.blockchain.rpcUrl,
        contractAddress: config.blockchain.contractAddress,
        walletAddress: blockchainService.wallet.address,
        walletBalance: balance + ' ETH',
        gasPrice: gasPrice + ' wei',
        isInitialized: blockchainService.isInitialized
      }
    }
  } catch (error) {
    detailedHealth.services.blockchain = {
      status: 'unhealthy',
      error: error.message
    }
  }

  // Detailed IPFS Check
  try {
    const ipfsStatus = await ipfsService.getNodeStatus()
    const ipfsHealth = await ipfsService.healthCheck()
    
    detailedHealth.services.ipfs = {
      status: ipfsHealth.isHealthy ? 'healthy' : 'unhealthy',
      details: {
        ...ipfsStatus,
        health: ipfsHealth
      }
    }
  } catch (error) {
    detailedHealth.services.ipfs = {
      status: 'unhealthy',
      error: error.message
    }
  }

  detailedHealth.responseTime = `${Date.now() - startTime}ms`

  res.json(detailedHealth)
})

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     description: Returns whether the service is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check critical services
    const dbHealth = await checkDatabaseHealth()
    const isDbReady = dbHealth.mongodb.status === 'connected'
    
    let isBlockchainReady = false
    try {
      if (!blockchainService.isInitialized) {
        await blockchainService.initialize()
      }
      isBlockchainReady = blockchainService.isInitialized
    } catch {
      isBlockchainReady = false
    }

    const isReady = isDbReady && isBlockchainReady

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      timestamp: new Date().toISOString(),
      checks: {
        database: isDbReady,
        blockchain: isBlockchainReady
      }
    })
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     description: Returns whether the service is alive (basic ping)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  })
})

export default router