# Blockchain Scripts Documentation

This directory contains the essential scripts for MediSeal smart contract deployment and management.

## Available Scripts

### 1. `deploy.js` (Main Deployment Script)
**Purpose**: Comprehensive deployment script with full functionality
**Features**:
- Deploys MediSeal contract to any network
- Shows detailed deployment information  
- Registers deployer as manufacturer automatically
- Saves deployment info to `deployment-info.json`
- Provides helpful next steps and troubleshooting

**Usage**:
```bash
# Deploy to hardhat network (default)
npm run deploy

# Deploy to localhost network  
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

### 2. `deploy-basic.js` (Simple Deployment)
**Purpose**: Minimal deployment script for testing
**Features**:
- Simple contract deployment only
- No additional setup or registration
- Useful for quick testing

**Usage**:
```bash
npm run deploy:basic
```

## Deployment Information

After successful deployment, contract information is saved to:
- `deployment-info.json` - Contains network, address, deployer, timestamp, and block number

## Network Configuration

Supported networks (configured in `hardhat.config.js`):
- **hardhat**: Local development network (default)  
- **localhost**: Local Hardhat node (requires `npm run node`)
- **sepolia**: Ethereum testnet (requires PRIVATE_KEY and SEPOLIA_URL in .env)

## Script Cleanup History

The following scripts were removed during cleanup (Sept 27, 2025):
- `deploy-persistent.js` - Referenced old contract name
- `deploy-simple.js` - Had signer compatibility issues  
- `gas-estimate.js` - Referenced old contract name "MediSealOptimized"
- `setup-laboratory.js` - Referenced old contract and hardcoded addresses
- `test-web3-workflow.js` - Referenced old contract and hardcoded addresses  
- `verify-deployment.js` - Referenced old contract and hardcoded addresses

Only working, essential scripts were retained for a clean project structure.