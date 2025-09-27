const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying MediSeal contract to ${network} network...`);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance. Make sure you have enough ETH for deployment.");
  }

  // Deploy the contract
  console.log("\n📦 Deploying MediSeal contract...");
  const MediSeal = await ethers.getContractFactory("MediSealOptimized");
  const mediSeal = await MediSeal.deploy();
  
  await mediSeal.waitForDeployment();
  const contractAddress = await mediSeal.getAddress();
  
    console.log(`✅ MediSeal deployed to: ${contractAddress}`);
  console.log(`🔗 Transaction hash: ${mediSeal.deploymentTransaction().hash}`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: mediSeal.deploymentTransaction().hash,
    blockNumber: mediSeal.deploymentTransaction().blockNumber
  };

  // Save to deployment file
  const deploymentPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }
  
  deployments[network] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  
  console.log(`💾 Deployment info saved to: ${deploymentPath}`);

  // Update environment files across all services
  await updateEnvironmentFiles(contractAddress, network);

  // Verify contract if on testnet
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await mediSeal.deploymentTransaction().wait(5);
    
    try {
      console.log("🔍 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  return contractAddress;
}

async function updateEnvironmentFiles(contractAddress, network) {
  console.log("\n🔄 Updating environment files...");
  
  const rootDir = path.join(__dirname, "../..");
  const services = ["backend", "frontend", "ipfs"];
  
  for (const service of services) {
    const envPath = path.join(rootDir, service, ".env");
    const envLocalPath = path.join(rootDir, service, ".env.local");
    
    // Update .env file
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      
      // Update or add contract address
      if (envContent.includes("MEDISEAL_CONTRACT_ADDRESS")) {
        envContent = envContent.replace(
          /MEDISEAL_CONTRACT_ADDRESS=.*/,
          `MEDISEAL_CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nMEDISEAL_CONTRACT_ADDRESS=${contractAddress}`;
      }
      
      // Update or add network info
      if (envContent.includes("DEPLOYMENT_NETWORK")) {
        envContent = envContent.replace(
          /DEPLOYMENT_NETWORK=.*/,
          `DEPLOYMENT_NETWORK=${network}`
        );
      } else {
        envContent += `\nDEPLOYMENT_NETWORK=${network}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Updated ${service}/.env`);
    }
    
    // Update .env.local for frontend
    if (service === "frontend" && fs.existsSync(envLocalPath)) {
      let envContent = fs.readFileSync(envLocalPath, "utf8");
      
      if (envContent.includes("NEXT_PUBLIC_MEDISEAL_CONTRACT_ADDRESS")) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_MEDISEAL_CONTRACT_ADDRESS=.*/,
          `NEXT_PUBLIC_MEDISEAL_CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_MEDISEAL_CONTRACT_ADDRESS=${contractAddress}`;
      }
      
      fs.writeFileSync(envLocalPath, envContent);
      console.log(`✅ Updated ${service}/.env.local`);
    }
  }
  
  // Update blockchain .env
  const blockchainEnvPath = path.join(__dirname, "../.env");
  if (fs.existsSync(blockchainEnvPath)) {
    let envContent = fs.readFileSync(blockchainEnvPath, "utf8");
    
    if (envContent.includes("MEDISEAL_CONTRACT_ADDRESS")) {
      envContent = envContent.replace(
        /MEDISEAL_CONTRACT_ADDRESS=.*/,
        `MEDISEAL_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nMEDISEAL_CONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(blockchainEnvPath, envContent);
    console.log(`✅ Updated blockchain/.env`);
  }
}

// Run the deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { main };
