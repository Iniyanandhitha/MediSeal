import QRCode from 'qrcode'
import crypto from 'crypto'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError } from '../middleware/errorHandler.js'

/**
 * QR Code service for generating and verifying QR codes
 */
class QRCodeService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'https://pharmachain.io'
    this.qrOptions = config.qr
  }

  /**
   * Generate QR code for batch verification
   */
  async generateBatchQR(batchData) {
    try {
      const { tokenId, batchNumber, manufacturer } = batchData

      logger.info('Generating QR code for batch:', { tokenId, batchNumber })

      // Create verification payload
      const verificationData = {
        tokenId,
        batchNumber,
        manufacturer,
        timestamp: Date.now(),
        version: '1.0'
      }

      // Create verification URL
      const verificationUrl = `${this.baseUrl}/verify/${tokenId}`
      
      // Generate hash for the QR code data
      const qrCodeHash = this._generateQRHash(verificationData)

      // Create QR code data
      const qrData = JSON.stringify({
        ...verificationData,
        url: verificationUrl,
        hash: qrCodeHash
      })

      // Generate QR code image
      const qrCodeImage = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: this.qrOptions.errorCorrectionLevel,
        type: 'png',
        quality: this.qrOptions.quality,
        margin: this.qrOptions.margin,
        color: this.qrOptions.color,
        width: this.qrOptions.width
      })

      // Also generate as data URL for immediate use
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: this.qrOptions.errorCorrectionLevel,
        quality: this.qrOptions.quality,
        margin: this.qrOptions.margin,
        color: this.qrOptions.color,
        width: this.qrOptions.width
      })

      logger.info('QR code generated successfully:', {
        tokenId,
        batchNumber,
        qrCodeHash,
        size: qrCodeImage.length
      })

      return {
        qrCodeImage,
        qrCodeDataUrl,
        qrCodeHash,
        verificationUrl,
        verificationData,
        metadata: {
          size: qrCodeImage.length,
          format: 'PNG',
          width: this.qrOptions.width,
          errorCorrectionLevel: this.qrOptions.errorCorrectionLevel
        }
      }
    } catch (error) {
      logger.error('Error generating QR code:', error)
      throw createError.internal('Failed to generate QR code')
    }
  }

  /**
   * Verify QR code data
   */
  async verifyQRCode(qrCodeData) {
    try {
      logger.info('Verifying QR code data')

      let parsedData
      try {
        parsedData = typeof qrCodeData === 'string' ? JSON.parse(qrCodeData) : qrCodeData
      } catch (parseError) {
        throw createError.invalidQRCode('Invalid QR code format')
      }

      // Validate required fields
      if (!parsedData.tokenId || !parsedData.batchNumber || !parsedData.hash) {
        throw createError.invalidQRCode('Missing required QR code fields')
      }

      // Verify hash
      const expectedHash = this._generateQRHash({
        tokenId: parsedData.tokenId,
        batchNumber: parsedData.batchNumber,
        manufacturer: parsedData.manufacturer,
        timestamp: parsedData.timestamp,
        version: parsedData.version
      })

      if (expectedHash !== parsedData.hash) {
        logger.warn('QR code hash verification failed:', {
          tokenId: parsedData.tokenId,
          expectedHash,
          providedHash: parsedData.hash
        })
        throw createError.invalidQRCode('QR code integrity check failed')
      }

      // Check timestamp (optional - could add expiration logic)
      const qrAge = Date.now() - parsedData.timestamp
      const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

      if (qrAge > maxAge) {
        logger.warn('QR code is too old:', {
          tokenId: parsedData.tokenId,
          age: Math.floor(qrAge / (24 * 60 * 60 * 1000)) + ' days'
        })
        // Note: Not throwing error for old QR codes, just logging
      }

      logger.info('QR code verified successfully:', {
        tokenId: parsedData.tokenId,
        batchNumber: parsedData.batchNumber
      })

      return {
        isValid: true,
        tokenId: parsedData.tokenId,
        batchNumber: parsedData.batchNumber,
        manufacturer: parsedData.manufacturer,
        verificationUrl: parsedData.url,
        timestamp: new Date(parsedData.timestamp).toISOString(),
        age: Math.floor(qrAge / (24 * 60 * 60 * 1000)) + ' days'
      }
    } catch (error) {
      if (error.code && error.code.includes('QR_CODE')) {
        throw error
      }
      
      logger.error('Error verifying QR code:', error)
      throw createError.internal('QR code verification failed')
    }
  }

  /**
   * Generate QR code for stakeholder verification
   */
  async generateStakeholderQR(stakeholderData) {
    try {
      const { walletAddress, name, role, licenseNumber } = stakeholderData

      logger.info('Generating stakeholder QR code:', { walletAddress, role })

      const verificationData = {
        walletAddress,
        name,
        role,
        licenseNumber,
        type: 'stakeholder',
        timestamp: Date.now(),
        version: '1.0'
      }

      const verificationUrl = `${this.baseUrl}/verify/stakeholder/${walletAddress}`
      const qrCodeHash = this._generateQRHash(verificationData)

      const qrData = JSON.stringify({
        ...verificationData,
        url: verificationUrl,
        hash: qrCodeHash
      })

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, this.qrOptions)

      return {
        qrCodeDataUrl,
        qrCodeHash,
        verificationUrl,
        verificationData
      }
    } catch (error) {
      logger.error('Error generating stakeholder QR code:', error)
      throw createError.internal('Failed to generate stakeholder QR code')
    }
  }

  /**
   * Parse QR code from image (would require image processing library)
   */
  async parseQRFromImage(imageBuffer) {
    try {
      // This would typically use a library like jimp + qrcode-reader
      // For now, we'll throw a not implemented error
      throw createError.internal('QR code parsing from image not implemented')
    } catch (error) {
      logger.error('Error parsing QR code from image:', error)
      throw createError.internal('Failed to parse QR code from image')
    }
  }

  /**
   * Batch generate QR codes
   */
  async batchGenerateQR(batchDataArray) {
    try {
      logger.info('Batch generating QR codes:', { count: batchDataArray.length })

      const results = []
      for (const batchData of batchDataArray) {
        try {
          const qrResult = await this.generateBatchQR(batchData)
          results.push({
            success: true,
            tokenId: batchData.tokenId,
            batchNumber: batchData.batchNumber,
            ...qrResult
          })
        } catch (error) {
          results.push({
            success: false,
            tokenId: batchData.tokenId,
            batchNumber: batchData.batchNumber,
            error: error.message
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      logger.info('Batch QR generation completed:', {
        total: batchDataArray.length,
        successful: successCount,
        failed: batchDataArray.length - successCount
      })

      return {
        results,
        summary: {
          total: batchDataArray.length,
          successful: successCount,
          failed: batchDataArray.length - successCount
        }
      }
    } catch (error) {
      logger.error('Error in batch QR generation:', error)
      throw createError.internal('Batch QR generation failed')
    }
  }

  /**
   * Generate different QR code formats
   */
  async generateMultiFormatQR(data, formats = ['png', 'svg', 'dataurl']) {
    try {
      const results = {}

      for (const format of formats) {
        switch (format) {
          case 'png':
            results.png = await QRCode.toBuffer(JSON.stringify(data), {
              ...this.qrOptions,
              type: 'png'
            })
            break
          case 'svg':
            results.svg = await QRCode.toString(JSON.stringify(data), {
              ...this.qrOptions,
              type: 'svg'
            })
            break
          case 'dataurl':
            results.dataUrl = await QRCode.toDataURL(JSON.stringify(data), this.qrOptions)
            break
          case 'terminal':
            results.terminal = await QRCode.toString(JSON.stringify(data), {
              type: 'terminal'
            })
            break
        }
      }

      return results
    } catch (error) {
      logger.error('Error generating multi-format QR codes:', error)
      throw createError.internal('Multi-format QR generation failed')
    }
  }

  /**
   * Validate QR code data structure
   */
  validateQRData(data) {
    const requiredFields = ['tokenId', 'batchNumber', 'timestamp', 'hash']
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          isValid: false,
          missingField: field,
          error: `Missing required field: ${field}`
        }
      }
    }

    // Validate timestamp
    if (isNaN(new Date(data.timestamp).getTime())) {
      return {
        isValid: false,
        error: 'Invalid timestamp format'
      }
    }

    // Validate hash format
    if (typeof data.hash !== 'string' || data.hash.length !== 64) {
      return {
        isValid: false,
        error: 'Invalid hash format'
      }
    }

    return {
      isValid: true
    }
  }

  /**
   * Generate cryptographic hash for QR code data
   */
  _generateQRHash(data) {
    const hashData = {
      tokenId: data.tokenId,
      batchNumber: data.batchNumber,
      manufacturer: data.manufacturer,
      timestamp: data.timestamp,
      version: data.version
    }

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex')
  }

  /**
   * Get QR code options
   */
  getQROptions() {
    return { ...this.qrOptions }
  }

  /**
   * Update QR code options
   */
  updateQROptions(newOptions) {
    this.qrOptions = { ...this.qrOptions, ...newOptions }
  }
}

// Create singleton instance
const qrCodeService = new QRCodeService()

export default qrCodeService