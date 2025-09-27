import IPFSServer from './server.js'
import logger from './utils/logger.js'

/**
 * PharmaChain IPFS Entry Point
 * Main entry point for IPFS integration module
 */

const PORT = process.env.PORT || 3001

async function main() {
  logger.info('🚀 Starting PharmaChain IPFS Integration...')
  
  try {
    // Create and start IPFS server
    const server = new IPFSServer(PORT)
    global.ipfsServer = server
    
    await server.start()
    
    logger.info('✅ PharmaChain IPFS Integration Started Successfully!', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid
    })
    
    logger.info('� IPFS Service Endpoints Available:', {
      baseUrl: `http://localhost:${PORT}`,
      endpoints: {
        health: 'GET /health',
        status: 'GET /status',
        uploadImage: 'POST /upload/image',
        uploadDocument: 'POST /upload/document',
        uploadMetadata: 'POST /upload/metadata',
        createBatchPackage: 'POST /upload/batch-package',
        retrieveFile: 'GET /retrieve/file/:cid',
        retrieveMetadata: 'GET /retrieve/metadata/:cid',
        pinContent: 'POST /pin/:cid',
        listPinned: 'GET /pinned',
        verifyContent: 'GET /verify/:cid',
        gatewayUrls: 'GET /gateway/:cid'
      }
    })
    
  } catch (error) {
    logger.error('❌ Failed to start PharmaChain IPFS:', { error: error.message, stack: error.stack })
    process.exit(1)
  }
}

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default main