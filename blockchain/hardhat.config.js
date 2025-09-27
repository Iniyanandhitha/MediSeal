require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000 // Increased runs for gas optimization
      },
      viaIR: true // Enable intermediate representation for better optimization
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto"
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/84842078b09946638c03157f83405213",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 15000000000, // Reduced to 15 gwei for lower costs
      gas: 5000000, // Reduced gas limit
      timeout: 60000
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL || "https://rpc-mumbai.maticvigil.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // Lower gas price for Mumbai
      gas: 5000000
    },
    hardhat: {
      // Use default hardhat accounts for local development
      gas: "auto",
      gasPrice: "auto",
      allowUnlimitedContractSize: false
    }
  },
  gasReporter: {
    enabled: true, // Always enable gas reporting for optimization
    currency: "USD",
    gasPrice: 15, // Set to Sepolia gas price for accurate estimates
    showTimeSpent: true,
    showMethodSig: true
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};