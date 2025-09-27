/**
 * IPFS + Blockchain Integration Example
 * Demonstrates document upload to IPFS and minting QR on blockchain
 */

import { MediSealIPFS } from '../ipfs/src/ipfs-manager.js';
import { ethers } from 'ethers';
import fs from 'fs';

// Load deployment info
const deploymentInfo = JSON.parse(fs.readFileSync('./blockchain/deployment-info.json', 'utf8'));

async function mintWithIPFS() {
  console.log('🚀 MediSeal: IPFS + Blockchain Integration\n');
  
  const ipfs = new MediSealIPFS();
  
  try {
    // 1. Initialize IPFS
    console.log('1. Initializing IPFS...');
    await ipfs.initialize();
    console.log('✅ IPFS ready\n');
    
    // 2. Upload document to IPFS
    console.log('2. Uploading pharmaceutical batch document...');
    const batchDocument = {
      batchNumber: 'MEDISEAL-2025-001',
      productName: 'MediSeal Tablets 500mg',
      manufacturer: 'PharmaCorp Ltd',
      manufacturingDate: '2025-09-27',
      expiryDate: '2027-09-27',
      quantity: 1000,
      qualityTests: {
        purity: '99.8%',
        potency: 'Within limits',
        microbiological: 'Passed',
        heavy_metals: 'Compliant'
      },
      certifications: ['FDA', 'WHO-GMP', 'ISO-9001'],
      timestamp: new Date().toISOString()
    };
    
    const documentBuffer = Buffer.from(JSON.stringify(batchDocument, null, 2));
    const ipfsResult = await ipfs.uploadDocument(documentBuffer, 'batch-MEDISEAL-2025-001.json');
    
    console.log('✅ Document uploaded to IPFS');
    console.log('📄 IPFS Hash:', ipfsResult.cid);
    console.log('🌐 Gateway URL:', ipfsResult.gatewayUrl);
    
    // 3. Connect to blockchain
    console.log('\n3. Connecting to blockchain...');
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const signer = await provider.getSigner();
    
    // Load contract ABI and connect
    const contractABI = JSON.parse(fs.readFileSync('./blockchain/artifacts/contracts/MediSeal.sol/MediSeal.json', 'utf8')).abi;
    const contract = new ethers.Contract(deploymentInfo.contractAddress, contractABI, signer);
    
    console.log('✅ Connected to MediSeal contract at:', deploymentInfo.contractAddress);
    
    // 4. Mint NFT with IPFS hash
    console.log('\n4. Minting pharmaceutical batch NFT...');
    const batchHash = ethers.keccak256(ethers.toUtf8Bytes(batchDocument.batchNumber));
    const qrHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsResult.cid));
    
    const manufacturingTimestamp = Math.floor(new Date(batchDocument.manufacturingDate).getTime() / 1000);
    const expiryTimestamp = Math.floor(new Date(batchDocument.expiryDate).getTime() / 1000);
    
    const mintTx = await contract.mintBatch(
      batchHash,
      qrHash,
      manufacturingTimestamp,
      expiryTimestamp,
      batchDocument.quantity,
      ipfsResult.cid // Store IPFS hash on-chain
    );
    
    const receipt = await mintTx.wait();
    console.log('✅ NFT minted successfully!');
    console.log('🔗 Transaction hash:', receipt.hash);
    console.log('📦 Batch on blockchain with IPFS document reference');
    
    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IPFS + BLOCKCHAIN INTEGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('📄 Document stored on IPFS:', ipfsResult.cid);
    console.log('🔗 Blockchain transaction:', receipt.hash);
    console.log('📱 QR Code will contain IPFS hash for document access');
    console.log('🌐 Anyone can verify document via IPFS gateway');
    console.log('⛓️  Batch ownership and transfers tracked on blockchain');
    
    const result = {
      success: true,
      ipfs: {
        hash: ipfsResult.cid,
        url: ipfsResult.ipfsUrl,
        gateway: ipfsResult.gatewayUrl
      },
      blockchain: {
        contract: deploymentInfo.contractAddress,
        transaction: receipt.hash,
        batchHash: batchHash,
        qrHash: qrHash
      },
      document: batchDocument
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    throw error;
  } finally {
    await ipfs.shutdown();
  }
}

// Export for use in other modules
export { mintWithIPFS };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  mintWithIPFS()
    .then((result) => {
      console.log('\n✨ Integration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration failed:', error);
      process.exit(1);
    });
}