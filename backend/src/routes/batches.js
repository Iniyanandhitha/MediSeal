import express from 'express'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError, asyncHandler } from '../middleware/errorHandler.js'
import { authenticate as authenticateToken, authorize as requireRole } from '../middleware/auth.js'
import blockchainService from '../services/blockchain.js'
import ipfsService from '../services/ipfs.js'
import qrService from '../services/qr.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     BatchMintRequest:
 *       type: object
 *       required:
 *         - productName
 *         - productDetails
 *       properties:
 *         productName:
 *           type: string
 *           example: "Aspirin 100mg"
 *         productDetails:
 *           type: object
 *           properties:
 *             manufacturer:
 *               type: string
 *             batchNumber:
 *               type: string
 *             expiryDate:
 *               type: string
 *               format: date
 *             quantity:
 *               type: number
 *         initialLocation:
 *           type: string
 *           example: "Manufacturing Plant A"
 *     
 *     BatchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             tokenId:
 *               type: string
 *             batch:
 *               $ref: '#/components/schemas/Batch'
 *             qrCode:
 *               type: object
 *               properties:
 *                 png:
 *                   type: string
 *                 svg:
 *                   type: string
 *                 dataUrl:
 *                   type: string
 */

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Get all batches
 *     description: Retrieve list of all pharmaceutical batches
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Created, InTransit, Delivered, Verified]
 *     responses:
 *       200:
 *         description: List of batches
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0, status } = req.query

  logger.info('Fetching batches:', { limit, offset, status, user: req.user.walletAddress })

  try {
    // Initialize blockchain service if needed
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // For now, we'll return a mock response since we need to implement
    // batch indexing or use events to track all batches
    const batches = []
    
    // TODO: Implement proper batch listing from blockchain events
    // This would involve querying Transfer events or maintaining an index

    res.json({
      success: true,
      data: {
        batches,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: batches.length
        }
      },
      message: 'Batches retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching batches:', error)
    throw createError.internal('Failed to fetch batches')
  }
}))

/**
 * @swagger
 * /api/batches/{tokenId}:
 *   get:
 *     summary: Get batch by token ID
 *     description: Retrieve detailed information about a specific batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch details
 *       404:
 *         description: Batch not found
 */
router.get('/:tokenId', authenticateToken, asyncHandler(async (req, res) => {
  const { tokenId } = req.params

  logger.info('Fetching batch:', { tokenId, user: req.user.walletAddress })

  try {
    // Initialize blockchain service if needed
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    const batch = await blockchainService.getBatch(tokenId)

    if (!batch) {
      throw createError.notFound('Batch not found')
    }

    res.json({
      success: true,
      data: { batch },
      message: 'Batch retrieved successfully'
    })
  } catch (error) {
    if (error.code === 'BATCH_NOT_FOUND') {
      throw createError.notFound('Batch not found')
    }
    logger.error('Error fetching batch:', error)
    throw createError.internal('Failed to fetch batch')
  }
}))

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Mint new pharmaceutical batch
 *     description: Create a new NFT representing a pharmaceutical batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchMintRequest'
 *     responses:
 *       201:
 *         description: Batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchResponse'
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticateToken, requireRole(['Manufacturer']), asyncHandler(async (req, res) => {
  const { productName, productDetails, initialLocation } = req.body
  const { walletAddress } = req.user

  if (!productName || !productDetails) {
    throw createError.badRequest('Product name and details are required')
  }

  logger.info('Minting new batch:', { 
    productName, 
    manufacturer: walletAddress,
    details: productDetails
  })

  try {
    // Initialize services
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Prepare metadata for IPFS
    const metadata = {
      productName,
      productDetails,
      initialLocation: initialLocation || 'Not specified',
      createdAt: new Date().toISOString(),
      createdBy: walletAddress,
      version: '1.0'
    }

    // Upload metadata to IPFS
    const ipfsHash = await ipfsService.uploadJSON(metadata)
    logger.info('Metadata uploaded to IPFS:', { ipfsHash })

    // Mint NFT on blockchain
    const result = await blockchainService.mintBatch(
      walletAddress, // to
      productName,
      ipfsHash,
      initialLocation || 'Manufacturing Facility'
    )

    const tokenId = result.tokenId
    logger.info('Batch minted successfully:', { 
      tokenId, 
      transactionHash: result.transactionHash 
    })

    // Generate QR code for the batch
    const qrCodeData = {
      tokenId,
      productName,
      manufacturer: walletAddress,
      verificationUrl: `http://localhost:${config.port || 3002}/verify/${tokenId}`,
      timestamp: new Date().toISOString()
    }

    const qrCode = await qrService.generateBatchQR(qrCodeData)

    // Get the complete batch information
    const batch = await blockchainService.getBatch(tokenId)

    res.status(201).json({
      success: true,
      data: {
        tokenId,
        batch,
        qrCode,
        ipfsHash,
        transactionHash: result.transactionHash
      },
      message: 'Batch created successfully'
    })
  } catch (error) {
    logger.error('Error minting batch:', error)
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw createError.badRequest('Insufficient funds for transaction')
    } else if (error.code === 'EXECUTION_REVERTED') {
      throw createError.badRequest('Transaction reverted: ' + error.message)
    }
    
    throw createError.internal('Failed to mint batch')
  }
}))

/**
 * @swagger
 * /api/batches/{tokenId}/transfer:
 *   post:
 *     summary: Transfer batch to another stakeholder
 *     description: Transfer ownership of a pharmaceutical batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toAddress
 *               - newLocation
 *             properties:
 *               toAddress:
 *                 type: string
 *                 example: "0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc"
 *               newLocation:
 *                 type: string
 *                 example: "Distribution Center B"
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer successful
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Not authorized to transfer
 *       404:
 *         description: Batch not found
 */
router.post('/:tokenId/transfer', authenticateToken, asyncHandler(async (req, res) => {
  const { tokenId } = req.params
  const { toAddress, newLocation, notes } = req.body
  const { walletAddress } = req.user

  if (!toAddress || !newLocation) {
    throw createError.badRequest('Recipient address and new location are required')
  }

  logger.info('Transferring batch:', { 
    tokenId, 
    from: walletAddress, 
    to: toAddress, 
    newLocation 
  })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Verify current ownership
    const batch = await blockchainService.getBatch(tokenId)
    if (!batch) {
      throw createError.notFound('Batch not found')
    }

    if (batch.currentOwner.toLowerCase() !== walletAddress.toLowerCase()) {
      throw createError.forbidden('You do not own this batch')
    }

    // Perform the transfer
    const result = await blockchainService.transferBatch(
      walletAddress,
      toAddress,
      tokenId,
      newLocation
    )

    logger.info('Batch transferred successfully:', {
      tokenId,
      transactionHash: result.transactionHash,
      from: walletAddress,
      to: toAddress
    })

    // Get updated batch information
    const updatedBatch = await blockchainService.getBatch(tokenId)

    res.json({
      success: true,
      data: {
        batch: updatedBatch,
        transactionHash: result.transactionHash,
        transferDetails: {
          from: walletAddress,
          to: toAddress,
          newLocation,
          notes: notes || '',
          timestamp: new Date().toISOString()
        }
      },
      message: 'Batch transferred successfully'
    })
  } catch (error) {
    logger.error('Error transferring batch:', error)
    
    if (error.code === 'BATCH_NOT_FOUND') {
      throw createError.notFound('Batch not found')
    } else if (error.code === 'EXECUTION_REVERTED') {
      throw createError.badRequest('Transfer failed: ' + error.message)
    }
    
    throw createError.internal('Failed to transfer batch')
  }
}))

/**
 * @swagger
 * /api/batches/{tokenId}/status:
 *   put:
 *     summary: Update batch status
 *     description: Update the current status of a pharmaceutical batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Created, InTransit, Delivered, Verified]
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Batch not found
 */
router.put('/:tokenId/status', authenticateToken, asyncHandler(async (req, res) => {
  const { tokenId } = req.params
  const { status, location, notes } = req.body
  const { walletAddress } = req.user

  if (!status) {
    throw createError.badRequest('Status is required')
  }

  const validStatuses = ['Created', 'InTransit', 'Delivered', 'Verified']
  if (!validStatuses.includes(status)) {
    throw createError.badRequest('Invalid status value')
  }

  logger.info('Updating batch status:', { 
    tokenId, 
    status, 
    location, 
    updatedBy: walletAddress 
  })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Update status on blockchain
    const result = await blockchainService.updateBatchStatus(
      tokenId,
      status,
      location || '',
      walletAddress
    )

    logger.info('Batch status updated:', {
      tokenId,
      status,
      transactionHash: result.transactionHash
    })

    // Get updated batch information
    const updatedBatch = await blockchainService.getBatch(tokenId)

    res.json({
      success: true,
      data: {
        batch: updatedBatch,
        transactionHash: result.transactionHash,
        statusUpdate: {
          status,
          location: location || '',
          notes: notes || '',
          updatedBy: walletAddress,
          timestamp: new Date().toISOString()
        }
      },
      message: 'Batch status updated successfully'
    })
  } catch (error) {
    logger.error('Error updating batch status:', error)
    
    if (error.code === 'BATCH_NOT_FOUND') {
      throw createError.notFound('Batch not found')
    } else if (error.code === 'EXECUTION_REVERTED') {
      throw createError.badRequest('Status update failed: ' + error.message)
    }
    
    throw createError.internal('Failed to update batch status')
  }
}))

/**
 * @swagger
 * /api/batches/{tokenId}/qr:
 *   get:
 *     summary: Get QR code for batch
 *     description: Generate or retrieve QR code for batch verification
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
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
 *         description: Batch not found
 */
router.get('/:tokenId/qr', authenticateToken, asyncHandler(async (req, res) => {
  const { tokenId } = req.params
  const { format = 'all' } = req.query

  logger.info('Generating QR code for batch:', { tokenId, format })

  try {
    // Initialize blockchain service
    if (!blockchainService.isInitialized) {
      await blockchainService.initialize()
    }

    // Verify batch exists
    const batch = await blockchainService.getBatch(tokenId)
    if (!batch) {
      throw createError.notFound('Batch not found')
    }

    // Generate QR code data
    const qrCodeData = {
      tokenId,
      productName: batch.productName,
      manufacturer: batch.mintedBy,
      currentOwner: batch.currentOwner,
      verificationUrl: `http://localhost:${config.port || 3002}/verify/${tokenId}`,
      timestamp: new Date().toISOString()
    }

    const qrCode = await qrService.generateBatchQR(qrCodeData)

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
        tokenId,
        qrCode: responseData,
        metadata: qrCodeData
      },
      message: 'QR code generated successfully'
    })
  } catch (error) {
    logger.error('Error generating QR code:', error)
    throw createError.internal('Failed to generate QR code')
  }
}))

export default router