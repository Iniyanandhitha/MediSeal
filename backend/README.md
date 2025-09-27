# MediSeal Backend API

A comprehensive REST API for pharmaceutical supply chain management with blockchain integration.

## Features

- 🔐 **JWT Authentication** - Secure wallet-based authentication
- 🏭 **Batch Management** - NFT-based pharmaceutical batch tracking
- 👥 **Stakeholder Management** - Role-based access control
- 🔗 **Blockchain Integration** - Direct smart contract interaction
- 📁 **IPFS Integration** - Decentralized metadata storage
- 📱 **QR Code Generation** - Batch and stakeholder verification
- 📊 **Health Monitoring** - Comprehensive system status
- 📖 **API Documentation** - Swagger/OpenAPI documentation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MediSeal Backend API                  │
├─────────────────────────────────────────────────────────────┤
│  Express.js API Server (Port 3002)                         │
│  ├── Authentication (JWT + Wallet Signatures)              │
│  ├── Batch Management (NFT Operations)                     │
│  ├── Stakeholder Management (Role-based Access)            │
│  └── QR Code Generation & Verification                     │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── Blockchain Service (Ethers.js → Smart Contracts)      │
│  ├── IPFS Service (HTTP Client → IPFS Server)              │
│  └── QR Service (QR Code Generation with Crypto Hash)      │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├── Blockchain (Hardhat Local Node - Port 8545)           │
│  ├── IPFS Server (Helia-based Server - Port 3001)          │
│  ├── MongoDB (Document Database)                           │
│  └── Redis (Caching & Session Management)                  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- Redis
- Hardhat blockchain node running on port 8545
- IPFS server running on port 3001

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access API Documentation**
   ```
   http://localhost:3002/api-docs
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Wallet-based login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and blacklist token
- `GET /api/auth/challenge` - Get signing challenge
- `POST /api/auth/verify-signature` - Verify wallet signature

### Batch Management
- `GET /api/batches` - List all batches
- `GET /api/batches/:tokenId` - Get batch details
- `POST /api/batches` - Mint new batch (Manufacturer only)
- `POST /api/batches/:tokenId/transfer` - Transfer batch ownership
- `PUT /api/batches/:tokenId/status` - Update batch status
- `GET /api/batches/:tokenId/qr` - Generate batch QR code

### Stakeholder Management
- `GET /api/stakeholders` - List stakeholders
- `GET /api/stakeholders/:walletAddress` - Get stakeholder details
- `POST /api/stakeholders/register` - Register new stakeholder
- `POST /api/stakeholders/:walletAddress/verify` - Verify stakeholder (Regulator only)
- `GET /api/stakeholders/:walletAddress/qr` - Generate stakeholder QR code
- `GET /api/stakeholders/me` - Get current user profile

### System
- `GET /api/health` - System health check
- `GET /api/health/detailed` - Detailed health status
- `GET /` - API information

### Public Verification
- `GET /verify/:tokenId` - Public batch verification
- `GET /verify/stakeholder/:walletAddress` - Public stakeholder verification

## Configuration

Key environment variables:

```bash
# Server
PORT=3002
BASE_URL=http://localhost:3002

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
MEDISEAL_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
BLOCKCHAIN_PRIVATE_KEY=your_private_key

# IPFS
IPFS_API_URL=http://localhost:3001

# Databases
MONGODB_URI=mongodb://localhost:27017/mediseal
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js              # Centralized configuration
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & authorization
│   │   └── errorHandler.js       # Error handling & logging
│   ├── routes/
│   │   ├── health.js             # Health monitoring endpoints
│   │   ├── auth.js               # Authentication routes
│   │   ├── batches.js            # Batch management routes
│   │   └── stakeholders.js       # Stakeholder routes
│   ├── services/
│   │   ├── blockchain.js         # Smart contract interaction
│   │   ├── ipfs.js              # IPFS integration
│   │   └── qr.js                # QR code generation
│   ├── utils/
│   │   ├── database.js          # Database connections
│   │   └── logger.js            # Winston logging
│   └── app.js                   # Express app configuration
├── server.js                    # Server entry point
├── package.json                 # Dependencies & scripts
└── .env.example                 # Environment template
```

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **JWT Blacklisting** - Token invalidation
- **Role-based Access Control** - Stakeholder permissions
- **Input Validation** - Request sanitization
- **Comprehensive Logging** - Security event tracking

## Stakeholder Roles

- **Manufacturer** - Can mint batches, update status
- **Distributor** - Can transfer batches, update locations
- **Pharmacy** - Can receive batches, mark as delivered
- **Regulator** - Can verify stakeholders, access all data

## Integration Points

### Blockchain Service
- Smart contract deployed at: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- Uses Ethers.js v6 for blockchain interaction
- Supports batch minting, transfers, status updates

### IPFS Service
- Connects to existing IPFS server on port 3001
- Uploads batch metadata as JSON
- Retrieves and verifies IPFS content

### QR Code Service
- Generates PNG, SVG, and Data URL formats
- Includes cryptographic hash verification
- Supports batch and stakeholder QR codes

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run lint       # Lint code
```

### Testing
```bash
# Test authentication
curl -X POST http://localhost:3002/api/auth/challenge?walletAddress=0x742d35cc6635c0532925a3b8d0fa6d0bd5e862dc

# Test health endpoint
curl http://localhost:3002/api/health

# View API documentation
open http://localhost:3002/api-docs
```

## Production Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure production database connections
   - Set secure JWT secrets

2. **Security Hardening**
   - Use HTTPS
   - Configure firewall rules
   - Set up monitoring and alerting

3. **Performance Optimization**
   - Enable Redis caching
   - Configure database indexes
   - Set up load balancing

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Common error codes:
- `AUTHENTICATION_REQUIRED` - Missing or invalid token
- `INSUFFICIENT_PERMISSIONS` - Role-based access denied
- `BATCH_NOT_FOUND` - Requested batch doesn't exist
- `STAKEHOLDER_NOT_FOUND` - Stakeholder not registered
- `BLOCKCHAIN_ERROR` - Smart contract interaction failed
- `IPFS_ERROR` - IPFS operation failed

## Monitoring

Health endpoints provide system status:
- Database connectivity
- Redis connectivity  
- Blockchain node status
- IPFS server status
- Memory and performance metrics

## Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include Swagger documentation for new endpoints
4. Write tests for new functionality
5. Update this README for new features

## License

MIT License - see LICENSE file for details