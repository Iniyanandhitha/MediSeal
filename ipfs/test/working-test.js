import { MediSealIPFS } from '../src/ipfs-manager.js';

/**
 * Working IPFS Document Upload Test for Blockchain Integration
 * Demonstrates successful document upload and hash generation
 */
async function testWorkingDocumentUpload() {
  console.log('🚀 IPFS Document Upload for Blockchain Integration\n');
  
  const ipfs = new MediSealIPFS();
  
  try {
    // Initialize IPFS
    console.log('1. Initializing IPFS...');
    await ipfs.initialize();
    console.log('✅ IPFS initialized successfully\n');
    
    // Upload document for QR code generation
    console.log('2. Uploading pharmaceutical document...');
    const document = {
      batchNumber: 'BATCH-ABC-123',
      productName: 'MediSeal Tablet',
      manufacturer: 'PharmaCorp Ltd',
      manufacturingDate: '2025-09-27',
      expiryDate: '2027-09-27',
      quantity: 1000,
      qualityCheck: 'PASSED',
      certification: 'FDA-2025-001',
      timestamp: new Date().toISOString()
    };
    
    const documentBuffer = Buffer.from(JSON.stringify(document, null, 2));
    const result = await ipfs.uploadDocument(documentBuffer, 'batch-info.json');
    
    console.log('✅ Document uploaded successfully!');
    console.log('📄 Document CID:', result.cid);
    console.log('🔗 IPFS URL:', result.ipfsUrl);
    console.log('🌐 Gateway URL:', result.gatewayUrl);
    
    // Verify retrieval
    console.log('\n3. Verifying document retrieval...');
    const retrieved = await ipfs.retrieveFile(result.cid);
    console.log('✅ Document retrieved successfully');
    console.log('📊 Size:', retrieved.length, 'bytes');
    
    // Show blockchain integration data
    console.log('\n4. 🎯 BLOCKCHAIN INTEGRATION READY!');
    console.log('='.repeat(50));
    
    const blockchainData = {
      // For blockchain storage
      batchHash: result.cid,        // Main document hash
      qrHash: result.cid,           // QR code will point to this
      
      // For frontend display
      ipfsUrl: result.ipfsUrl,
      gatewayUrl: result.gatewayUrl,
      
      // Metadata for smart contract
      batchNumber: document.batchNumber,
      manufacturingDate: document.manufacturingDate,
      expiryDate: document.expiryDate
    };
    
    console.log('📦 Ready for smart contract minting:');
    console.log(JSON.stringify(blockchainData, null, 2));
    
    console.log('\n📋 Next Steps:');
    console.log('1. Use batchHash in smart contract mint function');
    console.log('2. Generate QR code with qrHash');
    console.log('3. Store IPFS URL for document access');
    console.log('4. Frontend can fetch document from IPFS gateway');
    
    return blockchainData;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await ipfs.shutdown();
    console.log('\n🛑 IPFS shutdown complete');
  }
}

// Run the test
testWorkingDocumentUpload()
  .then((result) => {
    console.log('\n🎉 SUCCESS! IPFS is ready for blockchain integration.');
    console.log('💡 You can now use these hashes in your smart contract.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });