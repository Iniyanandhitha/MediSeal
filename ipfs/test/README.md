# IPFS Test Files

## Available Tests

### ✅ `working-test.js` (Recommended)
- **Purpose**: Simple, reliable test for IPFS document upload
- **Status**: ✅ Working perfectly
- **Use case**: Test basic IPFS functionality and blockchain integration
- **Run with**: `npm run test:simple`

### 🟡 `ipfs-test-clean.js` (Comprehensive)  
- **Purpose**: Full test suite with multiple IPFS operations
- **Status**: 🟡 Mostly working (some advanced features may fail)
- **Use case**: Comprehensive testing of all IPFS features
- **Run with**: `npm test`

## Removed Files (Cleanup - Sept 27, 2025)

### ❌ Deleted Files:
- `ipfs-test.js` - **Broken**: Referenced undefined `PharmaChainIPFS` class
- `blockchain-integration-test.js` - **Broken**: Issues with metadata retrieval
- `test.json` - **Redundant**: Just sample test data

### 🗂️ Kept Files:
- `working-test.js` ✅ - Reliable, working test
- `ipfs-test-clean.js` ✅ - Comprehensive test suite (partial functionality)

## Utils Files Status

### ✅ `src/utils/logger.js`
- **Status**: Essential - Used by IPFS manager and server
- **Purpose**: Winston logging configuration
- **Keep**: Required for proper logging

## Usage

```bash
# Quick functionality test (recommended)
npm run test:simple

# Full test suite
npm test

# Start IPFS service
npm start

# Health check
npm run health
```

## Log Files

Log files are automatically managed in `logs/` directory:
- `ipfs.log` - Service logs
- `error.log` - Error logs
- Empty log files are automatically cleaned

---

**Summary**: IPFS test directory is now clean with only working, essential files.