import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { createError } from '../middleware/errorHandler.js'

/**
 * Blockchain service for interacting with PharmaChain smart contract
 */
class BlockchainService {
  constructor() {
    this.provider = null
    this.contract = null
    this.wallet = null
    this.isInitialized = false
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      logger.info('Initializing blockchain service...')

      // Create provider
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)

      // Test connection
      const network = await this.provider.getNetwork()
      logger.info(`Connected to blockchain network: ${network.name} (Chain ID: ${network.chainId})`)

      // Create wallet
      this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider)
      logger.info(`Wallet address: ${this.wallet.address}`)

      // Load contract ABI from compiled artifacts
      let contractABI
      try {
        const artifactPath = path.resolve(__dirname, '../../../blockchain/artifacts/contracts/PharmaChain.sol/PharmaChain.json')
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
        contractABI = artifact.abi
        logger.info('Loaded contract ABI from artifacts')
      } catch (error) {
        logger.warn('Could not load ABI from artifacts, using fallback ABI')
        // Fallback ABI with essential methods
        contractABI = [
          // Essential ABI methods - this should be loaded from the compiled contract
          "function mintBatch(string memory _drugName, string memory _batchNumber, uint256 _manufacturingDate, uint256 _expiryDate, string memory _ipfsHash, uint256 _quantity, string memory _qrCodeHash) public returns (uint256)",
          "function transferBatch(uint256 _tokenId, address _to) public",
          "function updateBatchStatus(uint256 _tokenId, uint8 _status) public",
          "function getBatch(uint256 _tokenId) public view returns (tuple(uint256 tokenId, string drugName, string batchNumber, uint256 manufacturingDate, uint256 expiryDate, address manufacturer, string ipfsHash, uint8 status, uint256 quantity, string qrCodeHash))",
          "function verifyByQRCode(string memory _qrCodeHash) public view returns (uint256)",
          "function getAllBatches() public view returns (uint256[] memory)",
          "function getBatchesByManufacturer(address _manufacturer) public view returns (uint256[] memory)",
          "function recallBatch(uint256 _tokenId, string memory _reason) public",
          "function getTransferHistory(uint256 _tokenId) public view returns (tuple(address from, address to, uint256 timestamp)[] memory)",
          "function registerStakeholder(address _walletAddress, string memory _name, string memory _licenseNumber, uint8 _role) public",
          "function getStakeholder(address _walletAddress) public view returns (tuple(address walletAddress, string name, string licenseNumber, uint8 role, bool isVerified, uint256 registrationDate))",
          "function verifyStakeholder(address _stakeholder) public",
          "function getAllStakeholders() public view returns (address[] memory)",
          "function owner() public view returns (address)",
          "function name() public view returns (string memory)",
          "function symbol() public view returns (string memory)",
          "function totalSupply() public view returns (uint256)",
          "function tokenURI(uint256 tokenId) public view returns (string)"
        ]
      }

      // Create contract instance
      this.contract = new ethers.Contract(
        config.blockchain.contractAddress,
        contractABI,
        this.wallet
      )

      // Test contract connection
      const contractName = await this.contract.name()
      logger.info(`Connected to contract: ${contractName} at ${config.blockchain.contractAddress}`)

      this.isInitialized = true
      logger.info('Blockchain service initialized successfully')

      return true
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error)
      throw createError.serviceUnavailable('Blockchain service unavailable')
    }
  }

  /**
   * Ensure blockchain service is initialized
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw createError.serviceUnavailable('Blockchain service not initialized')
    }
  }

  /**
   * Mint a new batch NFT
   */
  async mintBatch(batchData) {
    this._ensureInitialized()

    try {
      logger.info('Minting new batch:', { batchNumber: batchData.batchNumber })

      const {
        drugName,
        batchNumber,
        manufacturingDate,
        expiryDate,
        ipfsHash,
        quantity,
        qrCodeHash
      } = batchData

      // Convert dates to timestamps if they're not already
      const mfgTimestamp = typeof manufacturingDate === 'string' 
        ? Math.floor(new Date(manufacturingDate).getTime() / 1000)
        : manufacturingDate

      const expTimestamp = typeof expiryDate === 'string'
        ? Math.floor(new Date(expiryDate).getTime() / 1000)
        : expiryDate

      const tx = await this.contract.mintBatch(
        drugName,
        batchNumber,
        mfgTimestamp,
        expTimestamp,
        ipfsHash,
        quantity,
        qrCodeHash,
        {
          gasLimit: config.blockchain.gasLimit,
          gasPrice: config.blockchain.gasPrice
        }
      )

      logger.info('Batch mint transaction sent:', { txHash: tx.hash })

      const receipt = await tx.wait()
      logger.info('Batch minted successfully:', { 
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber 
      })

      // Extract token ID from logs
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log)
          return parsed.name === 'Transfer' && parsed.args.from === ethers.ZeroAddress
        } catch {
          return false
        }
      })

      const tokenId = mintEvent ? mintEvent.args.tokenId.toString() : null

      logger.logBlockchainTransaction('MINT_BATCH', {
        batchNumber,
        tokenId,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      })

      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error) {
      logger.error('Error minting batch:', error)
      
      if (error.message.includes('execution reverted')) {
        throw createError.blockchainError('Batch minting failed: ' + error.reason)
      }
      
      throw createError.blockchainError('Failed to mint batch')
    }
  }

  /**
   * Get batch information by token ID
   */
  async getBatch(tokenId) {
    this._ensureInitialized()

    try {
      logger.info('Fetching batch:', { tokenId })

      const batch = await this.contract.getBatch(tokenId)

      return {
        tokenId: batch.tokenId.toString(),
        drugName: batch.drugName,
        batchNumber: batch.batchNumber,
        manufacturingDate: new Date(Number(batch.manufacturingDate) * 1000).toISOString(),
        expiryDate: new Date(Number(batch.expiryDate) * 1000).toISOString(),
        manufacturer: batch.manufacturer,
        ipfsHash: batch.ipfsHash,
        status: this._getStatusName(Number(batch.status)),
        quantity: Number(batch.quantity),
        qrCodeHash: batch.qrCodeHash
      }
    } catch (error) {
      logger.error('Error fetching batch:', error)
      
      if (error.message.includes('nonexistent token')) {
        throw createError.batchNotFound('Batch not found')
      }
      
      throw createError.blockchainError('Failed to fetch batch')
    }
  }

  /**
   * Get all batches
   */
  async getAllBatches() {
    this._ensureInitialized()

    try {
      logger.info('Fetching all batches')

      const tokenIds = await this.contract.getAllBatches()
      const batches = []

      for (const tokenId of tokenIds) {
        try {
          const batch = await this.getBatch(tokenId.toString())
          batches.push(batch)
        } catch (error) {
          logger.warn(`Failed to fetch batch ${tokenId}:`, error)
        }
      }

      logger.info(`Fetched ${batches.length} batches`)
      return batches
    } catch (error) {
      logger.error('Error fetching all batches:', error)
      throw createError.blockchainError('Failed to fetch batches')
    }
  }

  /**
   * Transfer batch ownership
   */
  async transferBatch(tokenId, toAddress, fromAddress) {
    this._ensureInitialized()

    try {
      logger.info('Transferring batch:', { tokenId, from: fromAddress, to: toAddress })

      const tx = await this.contract.transferBatch(tokenId, toAddress, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      })

      const receipt = await tx.wait()

      logger.logBlockchainTransaction('TRANSFER_BATCH', {
        tokenId,
        from: fromAddress,
        to: toAddress,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      })

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error) {
      logger.error('Error transferring batch:', error)
      throw createError.blockchainError('Failed to transfer batch')
    }
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(tokenId, status, updaterAddress) {
    this._ensureInitialized()

    try {
      const statusCode = this._getStatusCode(status)
      
      logger.info('Updating batch status:', { tokenId, status, statusCode })

      const tx = await this.contract.updateBatchStatus(tokenId, statusCode, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      })

      const receipt = await tx.wait()

      logger.logBlockchainTransaction('UPDATE_STATUS', {
        tokenId,
        status,
        updater: updaterAddress,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      })

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error) {
      logger.error('Error updating batch status:', error)
      throw createError.blockchainError('Failed to update batch status')
    }
  }

  /**
   * Verify batch by QR code hash
   */
  async verifyByQRCode(qrCodeHash) {
    this._ensureInitialized()

    try {
      logger.info('Verifying QR code:', { qrCodeHash })

      const tokenId = await this.contract.verifyByQRCode(qrCodeHash)
      
      if (tokenId.toString() === '0') {
        throw createError.invalidQRCode('QR code not found')
      }

      const batch = await this.getBatch(tokenId.toString())
      
      return {
        isValid: true,
        tokenId: tokenId.toString(),
        batch
      }
    } catch (error) {
      if (error.code === 'INVALID_QR_CODE') {
        throw error
      }
      
      logger.error('Error verifying QR code:', error)
      throw createError.blockchainError('Failed to verify QR code')
    }
  }

  /**
   * Recall a batch
   */
  async recallBatch(tokenId, reason, recallerAddress) {
    this._ensureInitialized()

    try {
      logger.info('Recalling batch:', { tokenId, reason })

      const tx = await this.contract.recallBatch(tokenId, reason, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      })

      const receipt = await tx.wait()

      logger.logBlockchainTransaction('RECALL_BATCH', {
        tokenId,
        reason,
        recaller: recallerAddress,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      })

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error) {
      logger.error('Error recalling batch:', error)
      throw createError.blockchainError('Failed to recall batch')
    }
  }

  /**
   * Register a new stakeholder
   */
  async registerStakeholder(stakeholderData) {
    this._ensureInitialized()

    try {
      const { walletAddress, name, licenseNumber, role } = stakeholderData
      const roleCode = this._getRoleCode(role)

      logger.info('Registering stakeholder:', { walletAddress, name, role })

      const tx = await this.contract.registerStakeholder(
        walletAddress,
        name,
        licenseNumber,
        roleCode,
        {
          gasLimit: config.blockchain.gasLimit,
          gasPrice: config.blockchain.gasPrice
        }
      )

      const receipt = await tx.wait()

      logger.logBlockchainTransaction('REGISTER_STAKEHOLDER', {
        walletAddress,
        name,
        role,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      })

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error) {
      logger.error('Error registering stakeholder:', error)
      throw createError.blockchainError('Failed to register stakeholder')
    }
  }

  /**
   * Get stakeholder information
   */
  async getStakeholder(walletAddress) {
    this._ensureInitialized()

    try {
      logger.info('Fetching stakeholder:', { walletAddress })

      const stakeholder = await this.contract.getStakeholder(walletAddress)

      return {
        walletAddress: stakeholder.walletAddress,
        name: stakeholder.name,
        licenseNumber: stakeholder.licenseNumber,
        role: this._getRoleName(Number(stakeholder.role)),
        isVerified: stakeholder.isVerified,
        registrationDate: new Date(Number(stakeholder.registrationDate) * 1000).toISOString()
      }
    } catch (error) {
      logger.error('Error fetching stakeholder:', error)
      
      if (error.message.includes('Stakeholder not found')) {
        throw createError.stakeholderNotFound('Stakeholder not found')
      }
      
      throw createError.blockchainError('Failed to fetch stakeholder')
    }
  }

  /**
   * Get transfer history for a batch
   */
  async getTransferHistory(tokenId) {
    this._ensureInitialized()

    try {
      logger.info('Fetching transfer history:', { tokenId })

      const history = await this.contract.getTransferHistory(tokenId)

      return history.map(transfer => ({
        from: transfer.from,
        to: transfer.to,
        timestamp: new Date(Number(transfer.timestamp) * 1000).toISOString()
      }))
    } catch (error) {
      logger.error('Error fetching transfer history:', error)
      throw createError.blockchainError('Failed to fetch transfer history')
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    this._ensureInitialized()

    try {
      const gasPrice = await this.provider.getFeeData()
      return gasPrice.gasPrice.toString()
    } catch (error) {
      logger.error('Error fetching gas price:', error)
      return config.blockchain.gasPrice
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address = this.wallet.address) {
    this._ensureInitialized()

    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      logger.error('Error fetching balance:', error)
      throw createError.blockchainError('Failed to fetch balance')
    }
  }

  /**
   * Helper methods for role and status conversion
   */
  _getRoleCode(roleName) {
    const roles = {
      'MANUFACTURER': 0,
      'DISTRIBUTOR': 1,
      'RETAILER': 2,
      'HEALTHCARE_PROVIDER': 3,
      'REGULATOR': 4
    }
    return roles[roleName] ?? 0
  }

  _getRoleName(roleCode) {
    const roles = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'HEALTHCARE_PROVIDER', 'REGULATOR']
    return roles[roleCode] || 'UNKNOWN'
  }

  _getStatusCode(statusName) {
    const statuses = {
      'MANUFACTURED': 0,
      'IN_TRANSIT': 1,
      'DELIVERED': 2,
      'DISPENSED': 3,
      'RECALLED': 4
    }
    return statuses[statusName] ?? 0
  }

  _getStatusName(statusCode) {
    const statuses = ['MANUFACTURED', 'IN_TRANSIT', 'DELIVERED', 'DISPENSED', 'RECALLED']
    return statuses[statusCode] || 'UNKNOWN'
  }
}

// Create singleton instance
const blockchainService = new BlockchainService()

export default blockchainService