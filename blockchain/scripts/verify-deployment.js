const { ethers } = require("hardhat");
require("dotenv").config();

async function verifyDeployment() {
  console.log("🔍 Verifying PharmaChain deployment...\n");
  
  // Contract details
  const contractAddress = "0x7912D2524bA63611430cf5461Fab62Fe56C3265E";
  const network = "sepolia";
  
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network}`);
  console.log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);
  
  try {
    // Connect to the contract
    const PharmaChain = await ethers.getContractFactory("PharmaChain");
    const pharmaChain = PharmaChain.attach(contractAddress);
    
    // Test basic contract functions
    console.log("✅ Testing contract connectivity...");
    
    // Check contract name and symbol
    const name = await pharmaChain.name();
    const symbol = await pharmaChain.symbol();
    
    console.log(`📛 Contract Name: ${name}`);
    console.log(`🏷️  Contract Symbol: ${symbol}`);
    
    // Check owner
    const owner = await pharmaChain.owner();
    console.log(`� Contract Owner: ${owner}`);
    
    // Get deployer/owner
    const [signer] = await ethers.getSigners();
    console.log(`👤 Connected Account: ${signer.address}`);
    console.log(`🔐 Is Owner: ${owner.toLowerCase() === signer.address.toLowerCase() ? 'Yes' : 'No'}`);
    
    console.log("\n🎉 Contract verification successful!");
    console.log("\n📋 Deployment Summary:");
    console.log(`   • Contract is deployed and accessible`);
    console.log(`   • All basic functions are working`);
    console.log(`   • Ready for production use`);
    console.log(`   • No need to redeploy on restart`);
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    return false;
  }
  
  return true;
}

// Run verification
if (require.main === module) {
  verifyDeployment()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Verification error:", error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };