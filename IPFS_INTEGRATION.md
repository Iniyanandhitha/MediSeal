# MediSeal IPFS Integration

## Overview
The IPFS (InterPlanetary File System) integration enables decentralized document storage for pharmaceutical batch information, which is then referenced on the blockchain for QR code generation and verification.

## Current Status: ✅ **WORKING**

### What's Working:
- ✅ IPFS service running on port 3001
- ✅ Document upload and hash generation
- ✅ File retrieval from IPFS
- ✅ Gateway URL access for documents
- ✅ Integration with blockchain smart contract

## Architecture

```
Frontend Upload → IPFS Storage → Hash Generation → Blockchain Minting → QR Generation
     ↓                ↓              ↓               ↓               ↓
  Documents       Decentralized   Content Hash    NFT Creation   QR Contains
  (Images/PDFs)   Storage (IPFS)  (bafkrei...)   (On-chain)     IPFS Hash
```

## How It Works

### 1. Document Upload
```javascript
// Frontend uploads document
const documentBuffer = Buffer.from(JSON.stringify(batchData));
const result = await ipfs.uploadDocument(documentBuffer, 'batch-info.json');

// Returns:
{
  cid: 'bafkreib3cnlafzae4knbxxebzcikfyuab7vui4qsvsbq6xacy3e4y7e2ea',
  ipfsUrl: 'ipfs://bafkreib3cnlafzae4knbxxebzcikfyuab7vui4qsvsbq6xacy3e4y7e2ea',
  gatewayUrl: 'https://ipfs.io/ipfs/bafkreib3cnlafzae4knbxxebzcikfyuab7vui4qsvsbq6xacy3e4y7e2ea'
}
```

### 2. Blockchain Integration
```javascript
// Store IPFS hash in smart contract
await contract.mintBatch(
  batchHash,           // Unique batch identifier
  qrHash,              // QR code hash
  manufacturingDate,   // Timestamp
  expiryDate,         // Timestamp
  quantity,           // Number of units
  result.cid          // IPFS document hash
);
```

### 3. QR Code Generation
```javascript
// QR code contains IPFS hash for document access
const qrData = {
  batchId: tokenId,
  ipfsHash: result.cid,
  verifyUrl: `${baseUrl}/verify/${tokenId}`,
  documentUrl: result.gatewayUrl
};
```

## API Endpoints

### IPFS Service (Port 3001)
- `GET /health` - Service health check
- `POST /upload/document` - Upload pharmaceutical documents
- `GET /retrieve/file/:cid` - Retrieve document by IPFS hash
- `POST /upload/batch-package` - Upload complete batch package

### Example Usage
```bash
# Upload document
curl -X POST http://localhost:3001/upload/document \
  -F "file=@batch-certificate.pdf" \
  -F "documentType=quality-certificate"

# Retrieve document
curl http://localhost:3001/retrieve/file/bafkreib3cnlafzae4knbxxebzcikfyuab7vui4qsvsbq6xacy3e4y7e2ea
```

## Integration Flow

### For Frontend Development:
1. **Document Upload**: Frontend sends files to IPFS service
2. **Hash Retrieval**: Get IPFS content hash (CID)
3. **Blockchain Minting**: Call smart contract with IPFS hash
4. **QR Generation**: Create QR with IPFS hash for verification

### For Document Verification:
1. **QR Scan**: Extract IPFS hash from QR code
2. **IPFS Retrieval**: Fetch document from IPFS using hash
3. **Blockchain Verification**: Check on-chain data matches IPFS content
4. **Display**: Show authenticated document to user

## Files Structure

```
ipfs/
├── src/
│   ├── ipfs-manager.js     # Core IPFS functionality
│   ├── server.js          # Express API server
│   └── index.js           # Service entry point
├── test/
│   ├── working-test.js    # ✅ Working integration test
│   └── blockchain-integration-test.js  # Full integration demo
└── package.json           # Dependencies and scripts

blockchain/
├── contracts/
│   └── MediSeal.sol       # Smart contract with IPFS integration
├── scripts/
│   └── deploy.js          # Deploy script
└── deployment-info.json   # Contract address and details
```

## Running the Services

### Start IPFS Service:
```bash
cd ipfs
npm install
npm start
# Service runs on http://localhost:3001
```

### Test Integration:
```bash
cd ipfs
node test/working-test.js
# Tests document upload and hash generation
```

### Blockchain Integration:
```bash
cd /home/iniya/projects/MediSeal
node ipfs-blockchain-integration.js
# Full end-to-end integration test
```

## Benefits

### 🔒 **Security**
- Documents stored on decentralized IPFS network
- Content-addressed storage (hash verifies integrity)
- Immutable document references on blockchain

### 🌐 **Accessibility**
- Documents accessible via multiple IPFS gateways
- No single point of failure
- Global content distribution

### ⛓️ **Blockchain Integration**
- Lightweight on-chain storage (just hashes)
- Full document verification possible
- Smart contract can reference IPFS content

### 📱 **QR Code Verification**
- QR contains IPFS hash
- Anyone can verify document authenticity
- Works without internet via local IPFS nodes

## Next Steps

1. **Frontend Integration**: Connect React frontend to IPFS API
2. **File Type Support**: Add support for PDFs, images, certificates  
3. **Batch Operations**: Upload multiple documents as packages
4. **Gateway Configuration**: Set up dedicated IPFS gateway
5. **Pinning Service**: Ensure document persistence with pinning

## Configuration

### Environment Variables (.env)
```bash
PORT=3001
NODE_ENV=development
HOST=localhost
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Network Configuration
- **Local Development**: Uses embedded Helia IPFS node
- **Production**: Can connect to external IPFS cluster
- **Blockchain**: Hardhat local network (port 8545)

---

✨ **IPFS integration is now fully functional and ready for frontend connection!**