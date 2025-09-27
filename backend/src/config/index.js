import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Application configuration
 * Centralized configuration management for the PharmaChain backend
 */
export const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmachain',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      options: {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true,
      }
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'pharmachain_development_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'pharmachain_refresh_secret',
    expiresIn: process.env.JWT_EXPIRE || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Blockchain configuration
  blockchain: {
    network: process.env.DEPLOYMENT_NETWORK || 'localhost',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
    contractAddress: process.env.PHARMACHAIN_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS || '0x7912D2524bA63611430cf5461Fab62Fe56C3265E',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    gasLimit: parseInt(process.env.GAS_LIMIT || '500000', 10),
    gasPrice: process.env.GAS_PRICE || '20000000000', // 20 gwei
  },

  // IPFS configuration
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'http://localhost:3001',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/',
    timeout: parseInt(process.env.IPFS_TIMEOUT || '30000', 10),
  },

  // Web3 configuration
  web3: {
    gasOptimization: true,
    maxGasPrice: 50000000000, // 50 gwei max
    gasLimit: 5000000,
    defaultGasPrice: 15000000000, // 15 gwei default
    blockConfirmations: 1
  },

  // External services
  external: {
    pinata: {
      apiKey: process.env.PINATA_API_KEY || '',
      secretKey: process.env.PINATA_SECRET_KEY || '',
    }
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10), // minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:19006', // React Native Metro
      'http://localhost:8081',  // Expo
    ],
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/pharmachain.log',
    enableConsole: process.env.NODE_ENV !== 'production',
    enableFile: process.env.ENABLE_FILE_LOGGING === 'true',
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/json'
    ],
    uploadDir: process.env.UPLOAD_DIR || 'uploads/',
  },

  // QR Code configuration
  qr: {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  },

  // Caching configuration
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10), // 10 minutes
  },

  // API configuration
  api: {
    version: '1.0.0',
    prefix: '/api',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    pagination: {
      defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT || '20', 10),
      maxLimit: parseInt(process.env.MAX_PAGE_LIMIT || '100', 10),
    }
  }
}

// Computed values
config.isDevelopment = config.nodeEnv === 'development'
config.isProduction = config.nodeEnv === 'production'
config.isTest = config.nodeEnv === 'test'

// Rate limiting configuration
config.rateLimitWindow = config.security.rateLimitWindow
config.rateLimitMaxRequests = config.security.rateLimitMaxRequests
config.allowedOrigins = config.security.allowedOrigins

// Validation
if (!config.jwt.secret || config.jwt.secret === 'pharmachain_development_secret') {
  if (config.isProduction) {
    throw new Error('JWT_SECRET must be set in production')
  }
  console.warn('⚠️  Using default JWT secret. Set JWT_SECRET in production!')
}

if (!config.blockchain.contractAddress) {
  throw new Error('PHARMACHAIN_CONTRACT_ADDRESS must be set')
}

if (config.isProduction && !config.database.mongodb.uri.includes('mongodb://localhost')) {
  // Production database validation
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in production')
  }
}

export default config