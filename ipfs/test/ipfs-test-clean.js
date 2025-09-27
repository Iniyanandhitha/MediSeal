import PharmaChainIPFS from '../src/ipfs-manager.js'
import logger from '../src/utils/logger.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Test suite for PharmaChain IPFS functionality
 * Professional test runner with proper logging and error handling
 */
class IPFSTestSuite {
  constructor() {
    this.ipfs = new PharmaChainIPFS()
    this.testResults = []
    this.startTime = Date.now()
  }

  async runAllTests() {
    logger.info('🧪 Starting PharmaChain IPFS Test Suite')

    try {
      // Core functionality tests
      await this.testIPFSInitialization()
      await this.testImageUpload()
      await this.testMetadataUpload()
      await this.testDocumentUpload()
      await this.testFileRetrieval()
      await this.testBatchPackageCreation()
      await this.testContentVerification()
      await this.testPinningOperations()
      
      // Performance tests
      await this.runPerformanceTests()
      
      this.generateTestReport()
      
    } catch (error) {
      logger.error('❌ Test suite failed:', { error: error.message, stack: error.stack })
      process.exit(1)
    }
  }

  async testIPFSInitialization() {
    return this.runTest('IPFS Node Initialization', async () => {
      const peerId = await this.ipfs.initialize()
      if (!peerId || typeof peerId !== 'string') {
        throw new Error('Failed to get valid peer ID')
      }
      logger.debug('IPFS peer initialized', { peerId })
      return { success: true, peerId }
    })
  }

  async testImageUpload() {
    return this.runTest('Package Image Upload', async () => {
      const testImage = this.createTestImageBuffer()
      const result = await this.ipfs.uploadPackagingImage(testImage, 'test-package.jpg')
      
      if (!result.cid || !result.metadata || !result.ipfsUrl) {
        throw new Error('Invalid upload result structure')
      }
      
      this.testImageCid = result.cid
      logger.debug('Image uploaded successfully', { cid: result.cid, url: result.ipfsUrl })
      return { success: true, cid: result.cid }
    })
  }

  async testMetadataUpload() {
    return this.runTest('Batch Metadata Upload', async () => {
      const testBatch = {
        batchNumber: 'TEST-001',
        drugName: 'Test Medicine',
        manufacturer: 'Test Pharma Co.',
        manufacturingDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: 1000,
        description: 'Test batch for IPFS integration'
      }
      
      const result = await this.ipfs.uploadBatchMetadata(testBatch)
      if (!result.cid || !result.metadata) {
        throw new Error('Failed to upload metadata')
      }
      
      this.testMetadataCid = result.cid
      logger.debug('Metadata uploaded successfully', { batchNumber: testBatch.batchNumber, cid: result.cid })
      return { success: true, batchNumber: testBatch.batchNumber }
    })
  }

  async testDocumentUpload() {
    return this.runTest('Document Upload', async () => {
      const testDoc = Buffer.from('This is a test pharmaceutical document for IPFS storage.')
      const result = await this.ipfs.uploadDocument(testDoc, 'test-certificate.txt', 'quality-certificate')
      
      if (!result.cid) {
        throw new Error('Failed to upload document')
      }
      
      this.testDocCid = result.cid
      logger.debug('Document uploaded successfully', { cid: result.cid })
      return { success: true, cid: result.cid }
    })
  }

  async testFileRetrieval() {
    return this.runTest('File Retrieval', async () => {
      if (!this.testImageCid) {
        throw new Error('No test image CID available')
      }
      
      const retrievedData = await this.ipfs.retrieveFile(this.testImageCid)
      if (!retrievedData || retrievedData.length === 0) {
        throw new Error('Failed to retrieve file data')
      }
      
      logger.debug('File retrieved successfully', { cid: this.testImageCid, size: retrievedData.length })
      return { success: true, dataSize: retrievedData.length }
    })
  }

  async testBatchPackageCreation() {
    return this.runTest('Complete Batch Package Creation', async () => {
      const packageData = {
        batchNumber: 'TEST-PKG-001',
        drugName: 'Test Package Medicine',
        manufacturer: 'Test Manufacturer',
        images: [this.createTestImageBuffer()],
        documents: [
          { content: Buffer.from('Quality Certificate'), name: 'quality.txt', type: 'certificate' },
          { content: Buffer.from('Safety Data Sheet'), name: 'safety.txt', type: 'safety' }
        ]
      }
      
      const result = await this.ipfs.createBatchPackage(packageData)
      if (!result.mainCid || !result.documents || result.documents.length === 0) {
        throw new Error('Failed to create batch package')
      }
      
      logger.debug('Batch package created successfully', { 
        mainCid: result.mainCid, 
        documentsCount: result.documents.length 
      })
      return { success: true, packageCid: result.mainCid }
    })
  }

  async testContentVerification() {
    return this.runTest('Content Verification', async () => {
      if (!this.testImageCid) {
        throw new Error('No test CID available for verification')
      }
      
      const verified = await this.ipfs.verifyContent(this.testImageCid)
      if (!verified) {
        throw new Error('Content verification failed')
      }
      
      logger.debug('Content verified successfully', { cid: this.testImageCid })
      return { success: true, verified: true }
    })
  }

  async testPinningOperations() {
    return this.runTest('Content Pinning Operations', async () => {
      if (!this.testImageCid) {
        throw new Error('No test CID available for pinning')
      }
      
      // Pin content
      await this.ipfs.pinContent(this.testImageCid)
      
      // List pinned content
      const pinnedContent = await this.ipfs.listPinnedContent()
      if (!Array.isArray(pinnedContent)) {
        throw new Error('Failed to list pinned content')
      }
      
      logger.debug('Pinning operations completed', { pinnedCount: pinnedContent.length })
      return { success: true, pinnedCount: pinnedContent.length }
    })
  }

  async runPerformanceTests() {
    logger.info('🚀 Running Performance Tests')
    
    // Test concurrent uploads
    await this.runTest('Concurrent Upload Performance', async () => {
      const uploadPromises = []
      const testFiles = 5
      
      for (let i = 0; i < testFiles; i++) {
        const testData = Buffer.from(`Performance test file ${i}`)
        uploadPromises.push(this.ipfs.uploadDocument(testData, `perf-test-${i}.txt`, 'performance-test'))
      }
      
      const startTime = Date.now()
      const results = await Promise.all(uploadPromises)
      const duration = Date.now() - startTime
      
      logger.debug('Concurrent upload performance', {
        filesUploaded: results.length,
        duration: `${duration}ms`,
        averagePerFile: `${(duration / results.length).toFixed(1)}ms`
      })
      
      return { success: true, filesUploaded: results.length, duration }
    })
  }

  async runTest(testName, testFunction) {
    logger.info(`🔍 Testing: ${testName}`)
    const startTime = Date.now()
    
    try {
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      this.testResults.push({
        name: testName,
        status: 'passed',
        duration,
        result
      })
      
      logger.info(`✅ PASSED: ${testName} (${duration}ms)`)
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.testResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      })
      
      logger.error(`❌ FAILED: ${testName} (${duration}ms)`, { error: error.message })
      throw error
    }
  }

  generateTestReport() {
    const totalDuration = Date.now() - this.startTime
    const passed = this.testResults.filter(test => test.status === 'passed').length
    const failed = this.testResults.filter(test => test.status === 'failed').length
    const total = this.testResults.length
    
    logger.info('📊 Test Suite Summary', {
      totalTests: total,
      passed,
      failed,
      successRate: `${((passed / total) * 100).toFixed(1)}%`,
      totalDuration: `${totalDuration}ms`,
      averageDuration: `${(totalDuration / total).toFixed(1)}ms`
    })
    
    if (failed > 0) {
      const failedTests = this.testResults.filter(test => test.status === 'failed')
      logger.error('❌ Failed Tests:', {
        tests: failedTests.map(test => ({ name: test.name, error: test.error }))
      })
    }
    
    logger.info(passed === total ? '✅ All tests passed successfully!' : `⚠️ ${failed} test(s) failed`)
  }

  createTestImageBuffer() {
    // Create a simple test image buffer (1x1 PNG)
    return Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new IPFSTestSuite()
  testSuite.runAllTests().then(() => {
    logger.info('🎉 Test suite completed successfully')
    process.exit(0)
  }).catch((error) => {
    logger.error('💥 Test suite failed', { error: error.message })
    process.exit(1)
  })
}

export default IPFSTestSuite