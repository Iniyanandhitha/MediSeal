import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import PharmaChainIPFS from './ipfs-manager.js'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * IPFS API Server for PharmaChain
 * Provides REST endpoints for IPFS operations
 */
class IPFSServer {
  constructor(port = 3001) {
    this.app = express()
    this.port = port
    this.ipfs = new PharmaChainIPFS()
    this.setupMiddleware()
    this.setupRoutes()
  }

  setupMiddleware() {
    // JSON parsing
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
      if (req.method === 'OPTIONS') {
        res.sendStatus(200)
      } else {
        next()
      }
    })

    // File upload configuration
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow images and documents
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|json/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (mimetype && extname) {
          return cb(null, true)
        } else {
          cb(new Error('Invalid file type. Only images and documents are allowed.'))
        }
      }
    })

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size exceeds 50MB limit'
          })
        }
      }
      
      console.error('Server error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    })
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'PharmaChain IPFS Server',
        timestamp: new Date().toISOString()
      })
    })

    // IPFS node status
    this.app.get('/status', async (req, res) => {
      try {
        const status = await this.ipfs.getNodeStatus()
        res.json({
          success: true,
          data: status
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Upload packaging image
    this.app.post('/upload/image', this.upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No image file provided'
          })
        }

        const result = await this.ipfs.uploadPackagingImage(
          req.file.buffer,
          req.file.originalname
        )

        res.json({
          success: true,
          data: result
        })
      } catch (error) {
        console.error('Image upload error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Upload document
    this.app.post('/upload/document', this.upload.single('document'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No document file provided'
          })
        }

        const documentType = req.body.documentType || 'document'

        const result = await this.ipfs.uploadDocument(
          req.file.buffer,
          req.file.originalname,
          documentType
        )

        res.json({
          success: true,
          data: result
        })
      } catch (error) {
        console.error('Document upload error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Upload batch metadata
    this.app.post('/upload/metadata', async (req, res) => {
      try {
        const batchData = req.body

        if (!batchData || !batchData.batchNumber) {
          return res.status(400).json({
            success: false,
            error: 'Batch data with batchNumber is required'
          })
        }

        const result = await this.ipfs.uploadBatchMetadata(batchData)

        res.json({
          success: true,
          data: result
        })
      } catch (error) {
        console.error('Metadata upload error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Create complete batch package
    this.app.post('/upload/batch-package', 
      this.upload.fields([
        { name: 'packageImage', maxCount: 1 },
        { name: 'documents', maxCount: 10 }
      ]), 
      async (req, res) => {
        try {
          const batchInfo = JSON.parse(req.body.batchInfo || '{}')
          
          if (!batchInfo.batchNumber) {
            return res.status(400).json({
              success: false,
              error: 'Batch information with batchNumber is required'
            })
          }

          if (!req.files?.packageImage?.[0]) {
            return res.status(400).json({
              success: false,
              error: 'Package image is required'
            })
          }

          // Prepare documents array
          const documents = (req.files?.documents || []).map(file => ({
            buffer: file.buffer,
            filename: file.originalname,
            type: file.fieldname || 'document'
          }))

          const result = await this.ipfs.createBatchPackage(
            batchInfo,
            req.files.packageImage[0].buffer,
            documents
          )

          res.json({
            success: true,
            data: result
          })
        } catch (error) {
          console.error('Batch package creation error:', error)
          res.status(500).json({
            success: false,
            error: error.message
          })
        }
      }
    )

    // Retrieve file by CID
    this.app.get('/retrieve/file/:cid', async (req, res) => {
      try {
        const { cid } = req.params

        if (!cid) {
          return res.status(400).json({
            success: false,
            error: 'CID parameter is required'
          })
        }

        const fileData = await this.ipfs.retrieveFile(cid)

        // Set appropriate headers
        res.set({
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileData.length,
          'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        })

        res.send(Buffer.from(fileData))
      } catch (error) {
        console.error('File retrieval error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Retrieve metadata by CID
    this.app.get('/retrieve/metadata/:cid', async (req, res) => {
      try {
        const { cid } = req.params

        if (!cid) {
          return res.status(400).json({
            success: false,
            error: 'CID parameter is required'
          })
        }

        const metadata = await this.ipfs.retrieveMetadata(cid)

        res.json({
          success: true,
          data: metadata
        })
      } catch (error) {
        console.error('Metadata retrieval error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Pin content
    this.app.post('/pin/:cid', async (req, res) => {
      try {
        const { cid } = req.params

        if (!cid) {
          return res.status(400).json({
            success: false,
            error: 'CID parameter is required'
          })
        }

        await this.ipfs.pinContent(cid)

        res.json({
          success: true,
          message: `Content ${cid} pinned successfully`
        })
      } catch (error) {
        console.error('Pin content error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // List pinned content
    this.app.get('/pinned', async (req, res) => {
      try {
        const pinnedCids = await this.ipfs.listPinnedContent()

        res.json({
          success: true,
          data: {
            count: pinnedCids.length,
            cids: pinnedCids
          }
        })
      } catch (error) {
        console.error('List pinned content error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Verify content integrity
    this.app.get('/verify/:cid', async (req, res) => {
      try {
        const { cid } = req.params

        if (!cid) {
          return res.status(400).json({
            success: false,
            error: 'CID parameter is required'
          })
        }

        const isValid = await this.ipfs.verifyContent(cid)

        res.json({
          success: true,
          data: {
            cid,
            isValid,
            timestamp: new Date().toISOString()
          }
        })
      } catch (error) {
        console.error('Content verification error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Get IPFS gateway URLs for CID
    this.app.get('/gateway/:cid', (req, res) => {
      try {
        const { cid } = req.params

        if (!cid) {
          return res.status(400).json({
            success: false,
            error: 'CID parameter is required'
          })
        }

        const gateways = [
          `https://ipfs.io/ipfs/${cid}`,
          `https://gateway.pinata.cloud/ipfs/${cid}`,
          `https://cloudflare-ipfs.com/ipfs/${cid}`,
          `https://dweb.link/ipfs/${cid}`
        ]

        res.json({
          success: true,
          data: {
            cid,
            ipfsUrl: `ipfs://${cid}`,
            gateways
          }
        })
      } catch (error) {
        console.error('Gateway URL generation error:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })
  }

  async start() {
    try {
      console.log('Initializing IPFS node...')
      await this.ipfs.initialize()

      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 PharmaChain IPFS Server running on port ${this.port}`)
        console.log(`📋 Health check: http://localhost:${this.port}/health`)
        console.log(`📊 Node status: http://localhost:${this.port}/status`)
        console.log(`📁 API endpoints available at: http://localhost:${this.port}`)
      })
    } catch (error) {
      console.error('Failed to start IPFS server:', error)
      process.exit(1)
    }
  }

  async stop() {
    try {
      console.log('Stopping IPFS server...')
      
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve)
        })
      }

      await this.ipfs.shutdown()
      console.log('IPFS server stopped successfully')
    } catch (error) {
      console.error('Error stopping IPFS server:', error)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Graceful shutdown...')
  if (global.ipfsServer) {
    await global.ipfsServer.stop()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...')
  if (global.ipfsServer) {
    await global.ipfsServer.stop()
  }
  process.exit(0)
})

export default IPFSServer

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new IPFSServer(3001)
  global.ipfsServer = server
  server.start()
}