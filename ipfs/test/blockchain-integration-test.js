import { MediSealIPFS } from '../src/ipfs-manager.js';
import { promises as fs } from 'fs';

/**
 * Simple IPFS Document Upload Test
 * Tests document upload and hash generation for blockchain integration
 */
async function testDocumentUpload() {
  console.log('🚀 Testing IPFS Document Upload for Blockchain Integration...\n');
  
  const ipfs = new MediSealIPFS();
  
  try {
    // Initialize IPFS
    console.log('1. Initializing IPFS...');
    await ipfs.initialize();
    console.log('✅ IPFS initialized successfully\n');
    
    // Test 1: Upload a simple text document
    console.log('2. Uploading test document...');
    const testDocument = {
      title: 'Quality Certificate',
      content: 'This is a test quality certificate for pharmaceutical batch ABC-123',
      timestamp: new Date().toISOString(),
      batchNumber: 'ABC-123'
    };
    
    // Convert to buffer for IPFS upload
    const documentBuffer = Buffer.from(JSON.stringify(testDocument, null, 2));
    const documentResult = await ipfs.uploadDocument(
      documentBuffer, 
      'quality-certificate.json'
    );
    const documentHash = documentResult.cid;
    console.log('✅ Document uploaded successfully');
    console.log('📄 Document Hash (CID):', documentHash);
    console.log('🔗 IPFS URL:', `ipfs://${documentHash}\n`);
    
    // Test 2: Upload batch metadata
    console.log('3. Uploading batch metadata...');
    const batchMetadata = {
      batchNumber: 'BATCH-001',
      manufacturingDate: '2025-09-27',
      expiryDate: '2027-09-27',
      manufacturer: 'PharmaCorp Ltd',
      quantity: 1000,
      productName: 'MediSeal Pills',
      documents: [documentHash], // Reference to uploaded document
      timestamp: new Date().toISOString()
    };
    
    const metadataResult = await ipfs.uploadBatchMetadata(batchMetadata);
    const metadataHash = metadataResult.cid;
    console.log('✅ Metadata uploaded successfully');
    console.log('📊 Metadata Hash (CID):', metadataHash);
    console.log('🔗 IPFS URL:', `ipfs://${metadataHash}\n`);
    
    // Test 3: Verify retrieval
    console.log('4. Verifying document retrieval...');
    const retrievedDoc = await ipfs.retrieveFile(documentHash);
    const retrievedMeta = await ipfs.retrieveFile(metadataHash);
    
    console.log('✅ Documents retrieved successfully');
    console.log('📄 Retrieved document size:', retrievedDoc.length, 'bytes');
    console.log('📊 Retrieved metadata size:', retrievedMeta.length, 'bytes\n');
    
    // Test 4: Generate blockchain-ready data
    console.log('5. Generating blockchain-ready data...');
    const blockchainData = {
      batchHash: metadataHash,  // Main hash to store in blockchain
      qrHash: documentHash,     // QR code hash 
      ipfsUrls: {
        metadata: `ipfs://${metadataHash}`,
        document: `ipfs://${documentHash}`
      }
    };
    
    console.log('✅ Blockchain-ready data generated:');
    console.log(JSON.stringify(blockchainData, null, 2));
    console.log('\n🎯 Ready for blockchain minting!');
    console.log('   - Use batchHash for blockchain storage');
    console.log('   - Use qrHash for QR code generation');
    console.log('   - Both hashes are permanently stored on IPFS');
    
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
testDocumentUpload()
  .then((result) => {
    console.log('\n🎉 Test completed successfully!');
    console.log('Ready to integrate with blockchain for QR minting.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });