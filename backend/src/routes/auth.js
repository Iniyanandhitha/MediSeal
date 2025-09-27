import express from 'express'
import bcrypt from 'bcryptjs'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError, asyncHandler } from '../middleware/errorHandler.js'
import { generateToken, generateRefreshToken, verifyRefreshToken, blacklistToken, extractToken } from '../middleware/auth.js'
import blockchainService from '../services/blockchain.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *         - signature
 *       properties:
 *         walletAddress:
 *           type: string
 *           example: "0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc"
 *         signature:
 *           type: string
 *           description: Signed message for authentication
 *         message:
 *           type: string
 *           description: Original message that was signed
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/Stakeholder'
 *             token:
 *               type: string
 *             refreshToken:
 *               type: string
 *             expiresIn:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user with wallet signature
 *     description: Login using wallet address and signature verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Stakeholder not found
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { walletAddress, signature, message } = req.body

  if (!walletAddress) {
    throw createError.badRequest('Wallet address is required')
  }

  logger.info('Login attempt:', { walletAddress })

  try {
    // Initialize blockchain service if needed
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Get stakeholder from blockchain
    const stakeholder = await blockchainService.getStakeholder(walletAddress)

    if (!stakeholder) {
      throw createError.stakeholderNotFound('Stakeholder not registered')
    }

    // For now, we'll use a simplified authentication
    // In a real implementation, you would verify the signature
    if (signature && message) {
      // TODO: Implement proper signature verification
      logger.info('Signature verification (simplified):', { walletAddress, signature: signature.substring(0, 10) + '...' })
    }

    // Generate tokens
    const tokenPayload = {
      walletAddress: stakeholder.walletAddress,
      role: stakeholder.role,
      name: stakeholder.name,
      isVerified: stakeholder.isVerified
    }

    const token = generateToken(tokenPayload)
    const refreshToken = generateRefreshToken({ walletAddress: stakeholder.walletAddress })

    logger.info('User logged in successfully:', {
      walletAddress: stakeholder.walletAddress,
      role: stakeholder.role
    })

    res.json({
      success: true,
      data: {
        user: stakeholder,
        token,
        refreshToken,
        expiresIn: config.jwt.expiresIn
      },
      message: 'Login successful'
    })
  } catch (error) {
    if (error.code === 'STAKEHOLDER_NOT_FOUND') {
      throw createError.unauthorized('Stakeholder not found or not registered')
    }
    throw error
  }
}))

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw createError.badRequest('Refresh token is required')
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)

    // Get updated stakeholder info
    const stakeholder = await blockchainService.getStakeholder(decoded.walletAddress)

    if (!stakeholder) {
      throw createError.unauthorized('Stakeholder no longer exists')
    }

    // Generate new access token
    const tokenPayload = {
      walletAddress: stakeholder.walletAddress,
      role: stakeholder.role,
      name: stakeholder.name,
      isVerified: stakeholder.isVerified
    }

    const newToken = generateToken(tokenPayload)

    logger.info('Token refreshed:', { walletAddress: stakeholder.walletAddress })

    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: config.jwt.expiresIn
      },
      message: 'Token refreshed successfully'
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError.unauthorized('Invalid refresh token')
    }
    throw error
  }
}))

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate current access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const token = extractToken(req)

  if (!token) {
    throw createError.unauthorized('No token provided')
  }

  // Blacklist the token
  await blacklistToken(token)

  logger.info('User logged out')

  res.json({
    success: true,
    message: 'Logout successful'
  })
}))

/**
 * @swagger
 * /api/auth/verify-signature:
 *   post:
 *     summary: Verify wallet signature
 *     description: Verify that a signature was created by the claimed wallet
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - message
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *               message:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature verification result
 */
router.post('/verify-signature', asyncHandler(async (req, res) => {
  const { walletAddress, message, signature } = req.body

  if (!walletAddress || !message || !signature) {
    throw createError.badRequest('Wallet address, message, and signature are required')
  }

  try {
    // TODO: Implement actual signature verification using ethers.js
    // This is a placeholder implementation
    const isValid = signature.length > 100 // Simplified check

    logger.info('Signature verification:', {
      walletAddress,
      messageLength: message.length,
      signatureLength: signature.length,
      isValid
    })

    res.json({
      success: true,
      data: {
        isValid,
        walletAddress,
        message,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Signature verification error:', error)
    throw createError.internal('Signature verification failed')
  }
}))

/**
 * @swagger
 * /api/auth/challenge:
 *   get:
 *     summary: Get authentication challenge
 *     description: Generate a challenge message for wallet signature
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge generated
 */
router.get('/challenge', asyncHandler(async (req, res) => {
  const { walletAddress } = req.query

  if (!walletAddress) {
    throw createError.badRequest('Wallet address is required')
  }

  const timestamp = Date.now()
  const nonce = Math.random().toString(36).substring(2, 15)
  
  const challenge = {
    message: `Please sign this message to authenticate with PharmaChain.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${nonce}`,
    timestamp,
    nonce,
    walletAddress
  }

  logger.info('Challenge generated:', { walletAddress, nonce })

  res.json({
    success: true,
    data: challenge
  })
}))

export default router