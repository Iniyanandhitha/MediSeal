import axios from 'axios'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError } from '../middleware/errorHandler.js'

/**
 * IPFS service for interacting with IPFS node
 */
class IPFSService {
  constructor() {
    this.apiUrl = config.ipfs.apiUrl
    this.gatewayUrl = config.ipfs.gatewayUrl
    this.timeout = config.ipfs.timeout
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Upload package image to IPFS
   */
  async uploadPackageImage(imageBuffer, filename) {
    try {
      logger.info('Uploading package image to IPFS:', { filename, size: imageBuffer.length })

      const formData = new FormData()
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
      formData.append('image', blob, filename)

      const response = await this.client.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        logger.logIPFSOperation('UPLOAD_IMAGE', {
          filename,
          cid: response.data.data.cid,
          size: imageBuffer.length
        })

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Upload failed')
      }
    } catch (error) {
      logger.error('Error uploading image to IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to upload image')
    }
  }

  /**
   * Upload document to IPFS
   */
  async uploadDocument(documentBuffer, filename, documentType = 'document') {
    try {
      logger.info('Uploading document to IPFS:', { filename, type: documentType, size: documentBuffer.length })

      const formData = new FormData()
      const blob = new Blob([documentBuffer])
      formData.append('document', blob, filename)
      formData.append('documentType', documentType)

      const response = await this.client.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        logger.logIPFSOperation('UPLOAD_DOCUMENT', {
          filename,
          type: documentType,
          cid: response.data.data.cid,
          size: documentBuffer.length
        })

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Upload failed')
      }
    } catch (error) {
      logger.error('Error uploading document to IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to upload document')
    }
  }

  /**
   * Upload batch metadata to IPFS
   */
  async uploadBatchMetadata(batchData) {
    try {
      logger.info('Uploading batch metadata to IPFS:', { batchNumber: batchData.batchNumber })

      const response = await this.client.post('/upload/metadata', batchData)

      if (response.data.success) {
        logger.logIPFSOperation('UPLOAD_METADATA', {
          batchNumber: batchData.batchNumber,
          cid: response.data.data.cid
        })

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Upload failed')
      }
    } catch (error) {
      logger.error('Error uploading metadata to IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to upload metadata')
    }
  }

  /**
   * Create complete batch package
   */
  async createBatchPackage(batchInfo, packageImage, documents = []) {
    try {
      logger.info('Creating complete batch package on IPFS:', { batchNumber: batchInfo.batchNumber })

      const formData = new FormData()
      
      // Add batch info
      formData.append('batchInfo', JSON.stringify(batchInfo))
      
      // Add package image
      if (packageImage) {
        const imageBlob = new Blob([packageImage], { type: 'image/jpeg' })
        formData.append('packageImage', imageBlob, `${batchInfo.batchNumber}_package.jpg`)
      }
      
      // Add documents
      documents.forEach((doc, index) => {
        const docBlob = new Blob([doc.buffer])
        formData.append('documents', docBlob, doc.filename)
      })

      const response = await this.client.post('/upload/batch-package', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        logger.logIPFSOperation('CREATE_BATCH_PACKAGE', {
          batchNumber: batchInfo.batchNumber,
          mainCid: response.data.data.mainCid,
          documentsCount: documents.length
        })

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Package creation failed')
      }
    } catch (error) {
      logger.error('Error creating batch package on IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to create batch package')
    }
  }

  /**
   * Retrieve file from IPFS by CID
   */
  async retrieveFile(cid) {
    try {
      logger.info('Retrieving file from IPFS:', { cid })

      const response = await this.client.get(`/retrieve/file/${cid}`, {
        responseType: 'arraybuffer'
      })

      logger.logIPFSOperation('RETRIEVE_FILE', {
        cid,
        size: response.data.byteLength
      })

      return new Uint8Array(response.data)
    } catch (error) {
      logger.error('Error retrieving file from IPFS:', error)
      
      if (error.response?.status === 404) {
        throw createError.notFound('File not found on IPFS')
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to retrieve file')
    }
  }

  /**
   * Retrieve metadata from IPFS by CID
   */
  async retrieveMetadata(cid) {
    try {
      logger.info('Retrieving metadata from IPFS:', { cid })

      const response = await this.client.get(`/retrieve/metadata/${cid}`)

      if (response.data.success) {
        logger.logIPFSOperation('RETRIEVE_METADATA', {
          cid,
          batchNumber: response.data.data.batchNumber
        })

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Retrieval failed')
      }
    } catch (error) {
      logger.error('Error retrieving metadata from IPFS:', error)
      
      if (error.response?.status === 404) {
        throw createError.notFound('Metadata not found on IPFS')
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to retrieve metadata')
    }
  }

  /**
   * Pin content to IPFS
   */
  async pinContent(cid) {
    try {
      logger.info('Pinning content on IPFS:', { cid })

      const response = await this.client.post(`/pin/${cid}`)

      if (response.data.success) {
        logger.logIPFSOperation('PIN_CONTENT', { cid })
        return true
      } else {
        throw new Error(response.data.error || 'Pinning failed')
      }
    } catch (error) {
      logger.error('Error pinning content on IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to pin content')
    }
  }

  /**
   * Verify content integrity on IPFS
   */
  async verifyContent(cid) {
    try {
      logger.info('Verifying content on IPFS:', { cid })

      const response = await this.client.get(`/verify/${cid}`)

      if (response.data.success) {
        const isValid = response.data.data.isValid
        
        logger.logIPFSOperation('VERIFY_CONTENT', {
          cid,
          isValid
        })

        return {
          isValid,
          cid,
          timestamp: response.data.data.timestamp
        }
      } else {
        throw new Error(response.data.error || 'Verification failed')
      }
    } catch (error) {
      logger.error('Error verifying content on IPFS:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to verify content')
    }
  }

  /**
   * Get IPFS gateway URLs for a CID
   */
  async getGatewayUrls(cid) {
    try {
      const response = await this.client.get(`/gateway/${cid}`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to get gateway URLs')
      }
    } catch (error) {
      logger.error('Error getting gateway URLs:', error)
      
      // Fallback to default gateways
      return {
        cid,
        ipfsUrl: `ipfs://${cid}`,
        gateways: [
          `${this.gatewayUrl}${cid}`,
          `https://ipfs.io/ipfs/${cid}`,
          `https://gateway.pinata.cloud/ipfs/${cid}`,
          `https://cloudflare-ipfs.com/ipfs/${cid}`
        ]
      }
    }
  }

  /**
   * Get IPFS node status
   */
  async getNodeStatus() {
    try {
      const response = await this.client.get('/status')

      if (response.data.success) {
        return {
          ...response.data.data,
          apiUrl: this.apiUrl,
          isConnected: true
        }
      } else {
        throw new Error(response.data.error || 'Status check failed')
      }
    } catch (error) {
      logger.error('Error getting IPFS node status:', error)
      
      if (error.code === 'ECONNREFUSED') {
        return {
          isConnected: false,
          error: 'IPFS service unavailable',
          apiUrl: this.apiUrl
        }
      }
      
      throw createError.ipfsError('Failed to get node status')
    }
  }

  /**
   * List pinned content
   */
  async listPinnedContent() {
    try {
      const response = await this.client.get('/pinned')

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to list pinned content')
      }
    } catch (error) {
      logger.error('Error listing pinned content:', error)
      
      if (error.code === 'ECONNREFUSED') {
        throw createError.ipfsError('IPFS service unavailable')
      }
      
      throw createError.ipfsError('Failed to list pinned content')
    }
  }

  /**
   * Health check for IPFS service
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 })
      return {
        isHealthy: response.status === 200,
        status: response.data?.status || 'unknown',
        apiUrl: this.apiUrl,
        responseTime: response.headers['x-response-time'] || 'unknown'
      }
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message,
        apiUrl: this.apiUrl
      }
    }
  }

  /**
   * Format file size for logging
   */
  _formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Validate CID format
   */
  _isValidCID(cid) {
    // Basic CID validation - starts with 'Qm' (v0) or 'bafy' (v1)
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[0-9a-z]{5,})/.test(cid)
  }
}

// Create singleton instance
const ipfsService = new IPFSService()

export default ipfsService