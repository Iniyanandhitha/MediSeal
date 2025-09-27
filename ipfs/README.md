# PharmaChain IPFS Integration

This module provides decentralized storage capabilities for the PharmaChain system using IPFS (InterPlanetary File System) and the Helia SDK.

## Features

### 🚀 Core Functionality
- **Decentralized Storage**: Store pharmaceutical packaging images and batch metadata on IPFS
- **Content Addressing**: Cryptographic hashes ensure data integrity and immutable references
- **Pinning Service**: Ensure important content remains available on the network
- **Multi-format Support**: Handle images, documents, and structured metadata
- **REST API**: Complete HTTP API for integration with other PharmaChain modules

### 📦 File Types Supported
- **Packaging Images**: JPEG, PNG, GIF format pharmaceutical package photos
- **Batch Metadata**: Structured JSON data with complete batch information
- **Documents**: Certificates, reports, compliance documents (PDF, DOC, TXT)
- **Complete Packages**: Combined batch data with all associated files

### 🔗 Integration Points
- **Blockchain Storage**: IPFS hashes stored in smart contracts for tamper-proof references
- **AI Model Input**: Package images retrieved for computer vision analysis
- **Mobile App**: Direct content access via IPFS gateways for QR code verification

## Quick Start

### Installation

```bash
cd ipfs/
npm install
```

### Start IPFS Server

```bash
npm start
```

The server will start on `http://localhost:3001` with full IPFS node initialization.

### Run Tests

```bash
npm test
```

## API Endpoints

### Health & Status
- `GET /health` - Server health check
- `GET /status` - IPFS node status and statistics

### Upload Operations
- `POST /upload/image` - Upload packaging image
- `POST /upload/document` - Upload document/certificate
- `POST /upload/metadata` - Upload batch metadata
- `POST /upload/batch-package` - Create complete batch package

### Retrieval Operations
- `GET /retrieve/file/:cid` - Download file by Content ID
- `GET /retrieve/metadata/:cid` - Get structured metadata by CID

### Content Management
- `POST /pin/:cid` - Pin content for persistence
- `GET /pinned` - List all pinned content
- `GET /verify/:cid` - Verify content integrity
- `GET /gateway/:cid` - Get public gateway URLs

## Usage Examples

### Upload Package Image

```bash
curl -X POST http://localhost:3001/upload/image \
  -F "image=@package-photo.jpg"
```

### Upload Batch Metadata

```bash
curl -X POST http://localhost:3001/upload/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "batchNumber": "BATCH-001",
    "productName": "Medicine Name",
    "manufacturer": "Pharma Corp",
    "expiryDate": "2025-12-31",
    "quantity": 1000
  }'
```

### Create Complete Batch Package

```bash
curl -X POST http://localhost:3001/upload/batch-package \
  -F "batchInfo={\"batchNumber\":\"PKG-001\",\"productName\":\"Test Med\"}" \
  -F "packageImage=@package.jpg" \
  -F "documents=@certificate.pdf" \
  -F "documents=@report.pdf"
```

### Retrieve Content

```bash
# Get file data
curl http://localhost:3001/retrieve/file/bafkreiezvaltuqlz6m65f6zcphtkaj66wfeibvpuwmzbyqifxshne6djem

# Get metadata
curl http://localhost:3001/retrieve/metadata/bafyreiblefkpgclsjmkyk2sfudlmlvrnoumnepei3vrkrd2cayx6kr7y6y
```

## Integration with PharmaChain

### Blockchain Integration

```javascript
// Store IPFS hash in smart contract
const ipfsHash = "bafkreiezvaltuqlz6m65f6zcphtkaj66wfeibvpuwmzbyqifxshne6djem"
await pharmaChainContract.mintBatch(
  batchNumber,
  manufacturer,
  ipfsHash,  // Store IPFS CID in blockchain
  otherMetadata
)
```

### AI Model Integration

```javascript
// Retrieve image for AI analysis
const imageData = await ipfs.retrieveFile(imageCid)
const aiResult = await aiModel.analyzePackaging(imageData)
```

### Mobile App Integration

```javascript
// Access via IPFS gateway
const gatewayUrl = `https://ipfs.io/ipfs/${cid}`
// or use local retrieval
const metadata = await fetch(`http://localhost:3001/retrieve/metadata/${cid}`)
```

## File Structure

```
ipfs/
├── src/
│   ├── index.js          # Entry point
│   ├── server.js         # Express server with REST API
│   └── ipfs-manager.js   # Core IPFS functionality
├── test/
│   └── ipfs-test.js      # Comprehensive test suite
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Key Classes

### PharmaChainIPFS
Core IPFS management class with methods:
- `initialize()` - Start IPFS node
- `uploadPackagingImage()` - Store package photos
- `uploadBatchMetadata()` - Store structured batch data
- `uploadDocument()` - Store certificates/documents
- `createBatchPackage()` - Create complete batch packages
- `retrieveFile()` - Download content by CID
- `retrieveMetadata()` - Get structured data
- `pinContent()` - Ensure content persistence
- `verifyContent()` - Check content integrity

### IPFSServer
Express.js server providing REST API:
- File upload handling with Multer
- Content type validation
- Error handling and logging
- CORS support for web integration
- Graceful shutdown handling

## Content Addressing

IPFS uses Content IDentifiers (CIDs) that are cryptographic hashes of the content:

```
bafkreiezvaltuqlz6m65f6zcphtkaj66wfeibvpuwmzbyqifxshne6djem
└─ Content hash ensures data integrity and immutable references
```

Benefits:
- **Immutable**: Content cannot be changed without changing the hash
- **Verifiable**: Anyone can verify content integrity
- **Deduplicated**: Identical content has the same hash
- **Distributed**: Content can be stored across multiple nodes

## Security Features

### Content Integrity
- Cryptographic hashing prevents tampering
- Content verification through CID validation
- Immutable references stored in blockchain

### Access Control
- File type validation prevents malicious uploads
- Size limits prevent DoS attacks
- CORS configuration for controlled web access

### Data Persistence
- Content pinning ensures important data remains available
- Multiple gateway options for redundancy
- Integration with public IPFS network

## Performance Considerations

### Optimization Tips
1. **Pin Important Content**: Ensure critical batch data is pinned
2. **Use Appropriate File Sizes**: Compress images while maintaining quality
3. **Batch Operations**: Upload related files together for efficiency
4. **Gateway Selection**: Use multiple gateways for redundancy

### Monitoring
- Node status endpoint provides health metrics
- Connection count indicates network participation
- Pinned content tracking for storage management

## Error Handling

The system includes comprehensive error handling:
- Network connectivity issues
- Invalid file formats
- Missing required parameters
- Content retrieval failures
- Node initialization problems

## Future Enhancements

### Planned Features
- **Cluster Integration**: Connect to IPFS clusters for enterprise deployment
- **Encryption Layer**: Add client-side encryption for sensitive data
- **CDN Integration**: Integrate with IPFS-based CDN services
- **Analytics**: Track content access and distribution metrics
- **Auto-pinning**: Intelligent content pinning based on usage patterns

### Scalability Improvements
- Load balancing across multiple IPFS nodes
- Content replication strategies
- Performance monitoring and optimization
- Integration with IPFS pinning services

## Dependencies

### Core IPFS
- `helia@^5.5.1` - Modern IPFS implementation for JavaScript
- `@helia/unixfs@^5.1.0` - File system interface
- `@helia/dag-cbor@^4.1.0` - Structured data handling
- `@helia/verified-fetch@^3.2.3` - Content retrieval

### Server & Utilities
- `express@^4.18.2` - HTTP server framework
- `multer@^1.4.5-lts.1` - File upload handling
- `cors@^2.8.5` - Cross-origin request support
- `multiformats@^13.1.0` - IPFS data formats

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Test integration with other PharmaChain modules

## License

MIT - See LICENSE file for details