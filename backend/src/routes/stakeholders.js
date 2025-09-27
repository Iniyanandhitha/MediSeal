import express from 'express'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError, asyncHandler } from '../middleware/errorHandler.js'
import { authenticate as authenticateToken, authorize as requireRole } from '../middleware/auth.js'
import blockchainService from '../services/blockchain.js'
import qrService from '../services/qr.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     StakeholderRegistration:
 *       type: object
 *       required:
 *         - walletAddress
 *         - name
 *         - role
 *         - contactInfo
 *       properties:
 *         walletAddress:
 *           type: string
 *           example: "0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc"
 *         name:
 *           type: string
 *           example: "PharmaCorp Manufacturing"
 *         role:
 *           type: string
 *           enum: [Manufacturer, Distributor, Pharmacy, Regulator]
 *         contactInfo:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *         businessLicense:
 *           type: string
 *           description: License number or registration ID
 *     
 *     Stakeholder:
 *       type: object
 *       properties:
 *         walletAddress:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *         contactInfo:
 *           type: object
 *         businessLicense:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         registeredAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/stakeholders:
 *   get:
 *     summary: Get all stakeholders
 *     description: Retrieve list of all registered stakeholders
 *     tags: [Stakeholders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Manufacturer, Distributor, Pharmacy, Regulator]
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of stakeholders
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { role, verified } = req.query

  logger.info('Fetching stakeholders:', { role, verified, requestedBy: req.user.walletAddress })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // TODO: Implement stakeholder listing from blockchain
    // For now, return mock data since we need to track all registered stakeholders
    const stakeholders = []

    // Filter by role if specified
    let filteredStakeholders = stakeholders
    if (role) {
      filteredStakeholders = stakeholders.filter(s => s.role === role)
    }
    if (verified !== undefined) {
      const isVerified = verified === 'true'
      filteredStakeholders = filteredStakeholders.filter(s => s.isVerified === isVerified)
    }

    res.json({
      success: true,
      data: {
        stakeholders: filteredStakeholders,
        total: filteredStakeholders.length,
        filters: { role, verified }
      },
      message: 'Stakeholders retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching stakeholders:', error)
    throw createError.internal('Failed to fetch stakeholders')
  }
}))

/**
 * @swagger
 * /api/stakeholders/{walletAddress}:
 *   get:
 *     summary: Get stakeholder by wallet address
 *     description: Retrieve detailed information about a specific stakeholder
 *     tags: [Stakeholders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stakeholder details
 *       404:
 *         description: Stakeholder not found
 */
router.get('/:walletAddress', authenticateToken, asyncHandler(async (req, res) => {
  const { walletAddress } = req.params

  logger.info('Fetching stakeholder:', { walletAddress, requestedBy: req.user.walletAddress })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    const stakeholder = await blockchainService.getStakeholder(walletAddress)

    if (!stakeholder) {
      throw createError.notFound('Stakeholder not found')
    }

    res.json({
      success: true,
      data: { stakeholder },
      message: 'Stakeholder retrieved successfully'
    })
  } catch (error) {
    if (error.code === 'STAKEHOLDER_NOT_FOUND') {
      throw createError.notFound('Stakeholder not found')
    }
    logger.error('Error fetching stakeholder:', error)
    throw createError.internal('Failed to fetch stakeholder')
  }
}))

/**
 * @swagger
 * /api/stakeholders/register:
 *   post:
 *     summary: Register new stakeholder
 *     description: Register a new stakeholder in the pharmaceutical supply chain
 *     tags: [Stakeholders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StakeholderRegistration'
 *     responses:
 *       201:
 *         description: Stakeholder registered successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Stakeholder already registered
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { walletAddress, name, role, contactInfo, businessLicense } = req.body

  if (!walletAddress || !name || !role || !contactInfo) {
    throw createError.badRequest('Wallet address, name, role, and contact info are required')
  }

  const validRoles = ['Manufacturer', 'Distributor', 'Pharmacy', 'Regulator']
  if (!validRoles.includes(role)) {
    throw createError.badRequest('Invalid role specified')
  }

  logger.info('Registering stakeholder:', { walletAddress, name, role })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Check if stakeholder already exists
    try {
      const existingStakeholder = await blockchainService.getStakeholder(walletAddress)
      if (existingStakeholder) {
        throw createError.conflict('Stakeholder already registered')
      }
    } catch (error) {
      // If stakeholder not found, continue with registration
      if (error.code !== 'STAKEHOLDER_NOT_FOUND') {
        throw error
      }
    }

    // Register stakeholder on blockchain
    const result = await blockchainService.registerStakeholder(
      walletAddress,
      name,
      role,
      JSON.stringify({ contactInfo, businessLicense })
    )

    logger.info('Stakeholder registered successfully:', {
      walletAddress,
      role,
      transactionHash: result.transactionHash
    })

    // Get the registered stakeholder
    const stakeholder = await blockchainService.getStakeholder(walletAddress)

    // Generate stakeholder QR code
    const qrCodeData = {
      walletAddress,
      name,
      role,
      verificationUrl: `http://localhost:${config.port || 3002}/verify/stakeholder/${walletAddress}`,
      timestamp: new Date().toISOString()
    }

    const qrCode = await qrService.generateStakeholderQR(qrCodeData)

    res.status(201).json({
      success: true,
      data: {
        stakeholder,
        qrCode,
        transactionHash: result.transactionHash
      },
      message: 'Stakeholder registered successfully'
    })
  } catch (error) {
    logger.error('Error registering stakeholder:', error)
    
    if (error.statusCode === 409) {
      throw error // Conflict error for already registered
    } else if (error.code === 'EXECUTION_REVERTED') {
      throw createError.badRequest('Registration failed: ' + error.message)
    }
    
    throw createError.internal('Failed to register stakeholder')
  }
}))

/**
 * @swagger
 * /api/stakeholders/{walletAddress}/verify:
 *   post:
 *     summary: Verify stakeholder
 *     description: Verify a stakeholder (admin only)
 *     tags: [Stakeholders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verified:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stakeholder verification updated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Stakeholder not found
 */
router.post('/:walletAddress/verify', authenticateToken, requireRole(['Regulator']), asyncHandler(async (req, res) => {
  const { walletAddress } = req.params
  const { verified, notes } = req.body
  const { walletAddress: verifierAddress } = req.user

  if (typeof verified !== 'boolean') {
    throw createError.badRequest('Verified status must be a boolean')
  }

  logger.info('Updating stakeholder verification:', {
    walletAddress,
    verified,
    verifiedBy: verifierAddress
  })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Verify stakeholder exists
    const stakeholder = await blockchainService.getStakeholder(walletAddress)
    if (!stakeholder) {
      throw createError.notFound('Stakeholder not found')
    }

    // TODO: Implement verification update on blockchain
    // For now, we'll simulate the verification process
    logger.info('Stakeholder verification updated:', {
      walletAddress,
      verified,
      notes: notes || '',
      verifiedBy: verifierAddress,
      timestamp: new Date().toISOString()
    })

    // Get updated stakeholder (in real implementation, this would reflect the blockchain state)
    const updatedStakeholder = { ...stakeholder, isVerified: verified }

    res.json({
      success: true,
      data: {
        stakeholder: updatedStakeholder,
        verification: {
          verified,
          verifiedBy: verifierAddress,
          notes: notes || '',
          timestamp: new Date().toISOString()
        }
      },
      message: `Stakeholder ${verified ? 'verified' : 'unverified'} successfully`
    })
  } catch (error) {
    if (error.code === 'STAKEHOLDER_NOT_FOUND') {
      throw createError.notFound('Stakeholder not found')
    }
    logger.error('Error updating stakeholder verification:', error)
    throw createError.internal('Failed to update verification status')
  }
}))

/**
 * @swagger
 * /api/stakeholders/{walletAddress}/qr:
 *   get:
 *     summary: Get QR code for stakeholder
 *     description: Generate QR code for stakeholder verification
 *     tags: [Stakeholders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, svg, dataUrl, all]
 *           default: all
 *     responses:
 *       200:
 *         description: QR code generated
 *       404:
 *         description: Stakeholder not found
 */
router.get('/:walletAddress/qr', authenticateToken, asyncHandler(async (req, res) => {
  const { walletAddress } = req.params
  const { format = 'all' } = req.query

  logger.info('Generating QR code for stakeholder:', { walletAddress, format })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Verify stakeholder exists
    const stakeholder = await blockchainService.getStakeholder(walletAddress)
    if (!stakeholder) {
      throw createError.notFound('Stakeholder not found')
    }

    // Generate QR code data
    const qrCodeData = {
      walletAddress: stakeholder.walletAddress,
      name: stakeholder.name,
      role: stakeholder.role,
      isVerified: stakeholder.isVerified,
      verificationUrl: `http://localhost:${config.port || 3002}/verify/stakeholder/${walletAddress}`,
      timestamp: new Date().toISOString()
    }

    const qrCode = await qrService.generateStakeholderQR(qrCodeData)

    // Return requested format
    let responseData
    switch (format) {
      case 'png':
        responseData = { png: qrCode.png }
        break
      case 'svg':
        responseData = { svg: qrCode.svg }
        break
      case 'dataUrl':
        responseData = { dataUrl: qrCode.dataUrl }
        break
      default:
        responseData = qrCode
    }

    res.json({
      success: true,
      data: {
        walletAddress,
        qrCode: responseData,
        metadata: qrCodeData
      },
      message: 'QR code generated successfully'
    })
  } catch (error) {
    logger.error('Error generating stakeholder QR code:', error)
    throw createError.internal('Failed to generate QR code')
  }
}))

/**
 * @swagger
 * /api/stakeholders/me:
 *   get:
 *     summary: Get current user's stakeholder profile
 *     description: Retrieve the authenticated user's stakeholder information
 *     tags: [Stakeholders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's stakeholder profile
 *       404:
 *         description: User not registered as stakeholder
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const { walletAddress } = req.user

  logger.info('Fetching current user profile:', { walletAddress })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    const stakeholder = await blockchainService.getStakeholder(walletAddress)

    if (!stakeholder) {
      throw createError.notFound('User not registered as stakeholder')
    }

    res.json({
      success: true,
      data: { stakeholder },
      message: 'Profile retrieved successfully'
    })
  } catch (error) {
    if (error.code === 'STAKEHOLDER_NOT_FOUND') {
      throw createError.notFound('User not registered as stakeholder')
    }
    logger.error('Error fetching user profile:', error)
    throw createError.internal('Failed to fetch profile')
  }
}))

export default router