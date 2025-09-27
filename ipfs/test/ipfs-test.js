import PharmaChainIPFS from '../src/ipfs-manager.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Test suite for PharmaChain IPFS functionality
 */
class IPFSTest {
  constructor() {
    this.ipfs = new PharmaChainIPFS()
    this.testResults = []
  }

  async runAllTests() {
    console.log('🧪 Starting PharmaChain IPFS Tests...\n')

    try {
      // Initialize IPFS
      await this.test('IPFS Node Initialization', async () => {
        const peerId = await this.ipfs.initialize()
        if (!peerId || typeof peerId !== 'string') {
          throw new Error('Failed to get valid peer ID')
        }
        console.log(`  ✓ Peer ID: ${peerId}`)
        return true
      })

      // Test image upload
      await this.test('Package Image Upload', async () => {
        const testImage = this.createTestImageBuffer()
        const result = await this.ipfs.uploadPackagingImage(testImage, 'test-package.jpg')
        
        if (!result.cid || !result.metadata || !result.ipfsUrl) {
          throw new Error('Invalid upload result structure')
        }
        
        console.log(`  ✓ Image CID: ${result.cid}`)
        console.log(`  ✓ IPFS URL: ${result.ipfsUrl}`)
        
        this.testImageCid = result.cid
        return true
      })

      // Test metadata upload
      await this.test('Batch Metadata Upload', async () => {
        const testBatch = {
          batchNumber: 'TEST-001',
          productName: 'Test Medicine',
          manufacturer: 'Test Pharma Ltd',
          expiryDate: '2025-12-31',
          quantity: 1000
        }
        
        const result = await this.ipfs.uploadBatchMetadata(testBatch)
        
        if (!result.cid || !result.metadata) {
          throw new Error('Invalid metadata upload result')
        }
        
        console.log(`  ✓ Metadata CID: ${result.cid}`)
        
        this.testMetadataCid = result.cid
        return true
      })

      // Test document upload
      await this.test('Document Upload', async () => {
        const testDocument = Buffer.from('This is a test certificate document', 'utf8')
        const result = await this.ipfs.uploadDocument(testDocument, 'test-cert.txt', 'certificate')
        
        if (!result.cid || !result.metadata) {
          throw new Error('Invalid document upload result')
        }
        
        console.log(`  ✓ Document CID: ${result.cid}`)
        
        this.testDocumentCid = result.cid
        return true
      })

      // Test file retrieval
      await this.test('File Retrieval', async () => {
        const retrievedData = await this.ipfs.retrieveFile(this.testImageCid)
        
        if (!retrievedData || !(retrievedData instanceof Uint8Array)) {
          throw new Error('Failed to retrieve file data')
        }
        
        console.log(`  ✓ Retrieved ${retrievedData.length} bytes`)
        return true
      })

      // Test metadata retrieval
      await this.test('Metadata Retrieval', async () => {
        const metadata = await this.ipfs.retrieveMetadata(this.testMetadataCid)
        
        if (!metadata || !metadata.batchNumber) {
          throw new Error('Failed to retrieve valid metadata')
        }
        
        console.log(`  ✓ Retrieved batch: ${metadata.batchNumber}`)
        return true
      })

      // Test content pinning
      await this.test('Content Pinning', async () => {
        await this.ipfs.pinContent(this.testImageCid)
        await this.ipfs.pinContent(this.testMetadataCid)
        
        const pinnedContent = await this.ipfs.listPinnedContent()
        
        if (!Array.isArray(pinnedContent) || pinnedContent.length === 0) {
          throw new Error('No pinned content found')
        }
        
        console.log(`  ✓ Pinned ${pinnedContent.length} items`)
        return true
      })

      // Test content verification
      await this.test('Content Verification', async () => {
        const isValid = await this.ipfs.verifyContent(this.testImageCid)
        
        if (!isValid) {
          throw new Error('Content verification failed')
        }
        
        console.log(`  ✓ Content verified successfully`)
        return true
      })

      // Test complete batch package creation
      await this.test('Complete Batch Package Creation', async () => {
        const batchInfo = {
          batchNumber: 'PKG-TEST-001',
          productName: 'Complete Test Medicine',
          manufacturer: 'Test Pharma Inc',
          expiryDate: '2025-06-30',
          quantity: 500,
          regulatoryApproval: 'FDA-2024-001'
        }
        
        const packageImage = this.createTestImageBuffer()
        const documents = [
          {
            buffer: Buffer.from('Quality assurance certificate', 'utf8'),
            filename: 'qa-cert.txt',
            type: 'certificate'
          },
          {
            buffer: Buffer.from('Manufacturing report data', 'utf8'),
            filename: 'manufacturing-report.txt',
            type: 'report'
          }
        ]
        
        const result = await this.ipfs.createBatchPackage(batchInfo, packageImage, documents)
        
        if (!result.mainCid || !result.packageImage || !result.documents) {
          throw new Error('Invalid batch package result')
        }
        
        console.log(`  ✓ Package CID: ${result.mainCid}`)
        console.log(`  ✓ Included ${result.documents.length} documents`)
        
        this.testPackageCid = result.mainCid
        return true
      })

      // Test node status
      await this.test('Node Status Check', async () => {
        const status = await this.ipfs.getNodeStatus()
        
        if (!status.peerId || !status.hasOwnProperty('connections')) {
          throw new Error('Invalid node status')
        }
        
        console.log(`  ✓ Peer ID: ${status.peerId}`)
        console.log(`  ✓ Connections: ${status.connections}`)
        console.log(`  ✓ Pinned items: ${status.pinnedCount}`)
        return true
      })

      // Summary
      this.printTestSummary()

    } catch (error) {
      console.error('❌ Test suite failed:', error)
    } finally {
      // Cleanup
      await this.ipfs.shutdown()
    }
  }

  async test(testName, testFunction) {
    try {
      console.log(`🔍 Testing: ${testName}`)
      const startTime = Date.now()
      
      const result = await testFunction()
      
      const duration = Date.now() - startTime
      console.log(`  ✅ PASSED (${duration}ms)\n`)
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration
      })
      
      return result
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}\n`)
      
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      })
      
      throw error
    }
  }

  createTestImageBuffer() {
    // Create a simple test image buffer (fake JPEG header + data)
    const header = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]) // JPEG header
    const data = Buffer.alloc(1000, 0x42) // Fill with dummy data
    return Buffer.concat([header, data])
  }

  printTestSummary() {
    console.log('📊 Test Summary:')
    console.log('=' * 50)
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length
    const failed = this.testResults.filter(r => r.status === 'FAILED').length
    const total = this.testResults.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`)
        })
    }
    
    const totalDuration = this.testResults.reduce((sum, r) => sum + (r.duration || 0), 0)
    console.log(`\nTotal Duration: ${totalDuration}ms`)
    console.log('=' * 50)
  }
}

// Performance test function
async function performanceTest() {
  console.log('🚀 Starting Performance Tests...\n')
  
  const ipfs = new PharmaChainIPFS()
  
  try {
    await ipfs.initialize()
    
    // Test multiple file uploads
    console.log('📁 Testing concurrent uploads...')
    const startTime = Date.now()
    
    const uploadPromises = []
    for (let i = 0; i < 5; i++) {
      const testData = Buffer.alloc(10000, i) // 10KB files
      uploadPromises.push(
        ipfs.uploadPackagingImage(testData, `perf-test-${i}.dat`)
      )
    }
    
    const results = await Promise.all(uploadPromises)
    const duration = Date.now() - startTime
    
    console.log(`  ✅ Uploaded ${results.length} files in ${duration}ms`)
    console.log(`  📊 Average: ${(duration / results.length).toFixed(1)}ms per file`)
    
    // Test retrieval performance
    console.log('\n📥 Testing retrieval performance...')
    const retrievalStart = Date.now()
    
    const retrievalPromises = results.map(result => 
      ipfs.retrieveFile(result.cid)
    )
    
    await Promise.all(retrievalPromises)
    const retrievalDuration = Date.now() - retrievalStart
    
    console.log(`  ✅ Retrieved ${results.length} files in ${retrievalDuration}ms`)
    console.log(`  📊 Average: ${(retrievalDuration / results.length).toFixed(1)}ms per file`)
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
  } finally {
    await ipfs.shutdown()
  }
}

// Run tests based on command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2] || 'all'
  
  if (testType === 'performance') {
    performanceTest()
  } else {
    const tester = new IPFSTest()
    tester.runAllTests()
  }
}

export default IPFSTest