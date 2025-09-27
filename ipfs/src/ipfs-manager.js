import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { dagCbor } from '@helia/dag-cbor'
import { CID } from 'multiformats/cid'

/**
 * MediSeal IPFS Manager
 * Handles decentralized storage for pharmaceutical batch data
 */
export class MediSealIPFS {
  constructor() {
    this.helia = null
    this.fs = null
    this.cbor = null
    this.isInitialized = false
  }

  /**
   * Initialize IPFS node
   */
  async initialize() {
    try {
      console.log('Initializing IPFS node...')
      
      // Create Helia node
      this.helia = await createHelia({
        // Configure for web-friendly operation
        config: {
          Addresses: {
            Swarm: [
              '/ip4/0.0.0.0/tcp/0/ws',
              '/webrtc'
            ]
          },
          Discovery: {
            webRTCStar: {
              Enabled: true
            },
            MDNS: {
              Enabled: false // Disable for web apps
            }
          }
        }
      })

      // Initialize file system interface
      this.fs = unixfs(this.helia)
      
      // Initialize DAG-CBOR interface for structured data
      this.cbor = dagCbor(this.helia)

      this.isInitialized = true
      console.log('IPFS node initialized successfully')
      console.log('Peer ID:', this.helia.libp2p.peerId.toString())
      
      return this.helia.libp2p.peerId.toString()
    } catch (error) {
      console.error('Failed to initialize IPFS node:', error)
      throw error
    }
  }

  /**
   * Upload packaging image to IPFS
   * @param {Buffer|Uint8Array} imageBuffer - Image data
   * @param {string} filename - Original filename
   * @returns {Promise<Object>} Upload result with CID and metadata
   */
  async uploadPackagingImage(imageBuffer, filename) {
    this._ensureInitialized()
    
    try {
      console.log(`Uploading packaging image: ${filename}`)
      
      // Add file to IPFS
      const cid = await this.fs.addBytes(imageBuffer)
      
      // Create metadata
      const metadata = {
        filename,
        uploadTime: new Date().toISOString(),
        size: imageBuffer.length,
        type: 'packaging-image',
        mimeType: this._getMimeType(filename),
        cid: cid.toString()
      }

      console.log(`Image uploaded successfully. CID: ${cid}`)
      
      return {
        cid: cid.toString(),
        metadata,
        ipfsUrl: `ipfs://${cid}`,
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`
      }
    } catch (error) {
      console.error('Failed to upload packaging image:', error)
      throw error
    }
  }

  /**
   * Upload batch metadata to IPFS
   * @param {Object} batchData - Complete batch information
   * @returns {Promise<Object>} Upload result with CID
   */
  async uploadBatchMetadata(batchData) {
    this._ensureInitialized()
    
    try {
      console.log(`Uploading batch metadata for: ${batchData.batchNumber}`)
      
      // Prepare metadata object
      const metadata = {
        ...batchData,
        uploadTime: new Date().toISOString(),
        type: 'batch-metadata',
        version: '1.0'
      }

      // Store as DAG-CBOR for structured data
      const cid = await this.cbor.add(metadata)

      console.log(`Batch metadata uploaded successfully. CID: ${cid}`)
      
      return {
        cid: cid.toString(),
        metadata,
        ipfsUrl: `ipfs://${cid}`,
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`
      }
    } catch (error) {
      console.error('Failed to upload batch metadata:', error)
      throw error
    }
  }

  /**
   * Upload certificate or document to IPFS
   * @param {Buffer|Uint8Array} documentBuffer - Document data
   * @param {string} filename - Original filename
   * @param {string} documentType - Type of document (certificate, report, etc.)
   * @returns {Promise<Object>} Upload result with CID
   */
  async uploadDocument(documentBuffer, filename, documentType = 'document') {
    this._ensureInitialized()
    
    try {
      console.log(`Uploading document: ${filename} (${documentType})`)
      
      // Add document to IPFS
      const cid = await this.fs.addBytes(documentBuffer)
      
      // Create metadata
      const metadata = {
        filename,
        documentType,
        uploadTime: new Date().toISOString(),
        size: documentBuffer.length,
        mimeType: this._getMimeType(filename),
        cid: cid.toString()
      }

      console.log(`Document uploaded successfully. CID: ${cid}`)
      
      return {
        cid: cid.toString(),
        metadata,
        ipfsUrl: `ipfs://${cid}`,
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
      throw error
    }
  }

  /**
   * Retrieve file from IPFS by CID
   * @param {string} cidString - Content identifier
   * @returns {Promise<Uint8Array>} File data
   */
  async retrieveFile(cidString) {
    this._ensureInitialized()
    
    try {
      console.log(`Retrieving file from IPFS: ${cidString}`)
      
      const cid = CID.parse(cidString)
      const chunks = []
      
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk)
      }
      
      const fileData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      
      for (const chunk of chunks) {
        fileData.set(chunk, offset)
        offset += chunk.length
      }
      
      console.log(`File retrieved successfully. Size: ${fileData.length} bytes`)
      return fileData
    } catch (error) {
      console.error('Failed to retrieve file:', error)
      throw error
    }
  }

  /**
   * Retrieve structured data from IPFS by CID
   * @param {string} cidString - Content identifier
   * @returns {Promise<Object>} Parsed data object
   */
  async retrieveMetadata(cidString) {
    this._ensureInitialized()
    
    try {
      console.log(`Retrieving metadata from IPFS: ${cidString}`)
      
      const cid = CID.parse(cidString)
      const data = await this.cbor.get(cid)
      
      console.log('Metadata retrieved successfully')
      return data
    } catch (error) {
      console.error('Failed to retrieve metadata:', error)
      throw error
    }
  }

  /**
   * Pin content to ensure persistence
   * @param {string} cidString - Content identifier to pin
   */
  async pinContent(cidString) {
    this._ensureInitialized()
    
    try {
      console.log(`Pinning content: ${cidString}`)
      
      const cid = CID.parse(cidString)
      await this.helia.pins.add(cid)
      
      console.log('Content pinned successfully')
    } catch (error) {
      console.error('Failed to pin content:', error)
      throw error
    }
  }

  /**
   * List all pinned content
   * @returns {Promise<Array>} Array of pinned CIDs
   */
  async listPinnedContent() {
    this._ensureInitialized()
    
    try {
      const pinnedCids = []
      
      for await (const cid of this.helia.pins.ls()) {
        pinnedCids.push(cid.toString())
      }
      
      console.log(`Found ${pinnedCids.length} pinned items`)
      return pinnedCids
    } catch (error) {
      console.error('Failed to list pinned content:', error)
      throw error
    }
  }

  /**
   * Create a complete batch package with all files
   * @param {Object} batchInfo - Batch information
   * @param {Buffer} packageImage - Packaging image
   * @param {Array} documents - Additional documents
   * @returns {Promise<Object>} Complete package CID and structure
   */
  async createBatchPackage(batchInfo, packageImage, documents = []) {
    this._ensureInitialized()
    
    try {
      console.log(`Creating complete batch package for: ${batchInfo.batchNumber}`)
      
      // Upload packaging image
      const imageResult = await this.uploadPackagingImage(
        packageImage, 
        `${batchInfo.batchNumber}_package.jpg`
      )
      
      // Upload documents
      const documentResults = []
      for (const doc of documents) {
        const docResult = await this.uploadDocument(
          doc.buffer, 
          doc.filename, 
          doc.type
        )
        documentResults.push(docResult)
      }
      
      // Create complete batch metadata
      const completeMetadata = {
        ...batchInfo,
        packageImage: {
          cid: imageResult.cid,
          filename: imageResult.metadata.filename,
          size: imageResult.metadata.size
        },
        documents: documentResults.map(doc => ({
          cid: doc.cid,
          filename: doc.metadata.filename,
          type: doc.metadata.documentType,
          size: doc.metadata.size
        })),
        packageCreatedAt: new Date().toISOString(),
        version: '1.0'
      }
      
      // Upload complete metadata
      const metadataResult = await this.uploadBatchMetadata(completeMetadata)
      
      // Pin all content for persistence
      await this.pinContent(imageResult.cid)
      await this.pinContent(metadataResult.cid)
      
      for (const doc of documentResults) {
        await this.pinContent(doc.cid)
      }
      
      console.log(`Batch package created successfully. Main CID: ${metadataResult.cid}`)
      
      return {
        mainCid: metadataResult.cid,
        packageImage: imageResult,
        documents: documentResults,
        metadata: metadataResult,
        ipfsUrl: `ipfs://${metadataResult.cid}`,
        gatewayUrl: `https://ipfs.io/ipfs/${metadataResult.cid}`
      }
    } catch (error) {
      console.error('Failed to create batch package:', error)
      throw error
    }
  }

  /**
   * Verify content integrity by CID
   * @param {string} cidString - Content identifier to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifyContent(cidString) {
    try {
      console.log(`Verifying content: ${cidString}`)
      
      const cid = CID.parse(cidString)
      
      // Try to retrieve a small portion to verify accessibility
      const chunks = []
      let chunkCount = 0
      
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk)
        chunkCount++
        if (chunkCount > 5) break // Just verify first few chunks
      }
      
      const isValid = chunks.length > 0
      console.log(`Content verification: ${isValid ? 'VALID' : 'INVALID'}`)
      
      return isValid
    } catch (error) {
      console.error('Content verification failed:', error)
      return false
    }
  }

  /**
   * Get node status and statistics
   * @returns {Promise<Object>} Node status information
   */
  async getNodeStatus() {
    this._ensureInitialized()
    
    try {
      const peerId = this.helia.libp2p.peerId.toString()
      const connections = this.helia.libp2p.getConnections().length
      const pinnedContent = await this.listPinnedContent()
      
      return {
        peerId,
        connections,
        pinnedCount: pinnedContent.length,
        isOnline: true,
        version: '1.0.0'
      }
    } catch (error) {
      console.error('Failed to get node status:', error)
      throw error
    }
  }

  /**
   * Shutdown IPFS node gracefully
   */
  async shutdown() {
    if (this.helia) {
      console.log('Shutting down IPFS node...')
      await this.helia.stop()
      this.isInitialized = false
      console.log('IPFS node stopped')
    }
  }

  /**
   * Private helper methods
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('IPFS node not initialized. Call initialize() first.')
    }
  }

  _getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase()
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'json': 'application/json'
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }
}

export default MediSealIPFS