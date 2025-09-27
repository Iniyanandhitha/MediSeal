async function main() {
  const { ethers, network } = require("hardhat");
  const fs = require("fs");
  
  console.log("🚀 MediSeal Smart Contract Deployment");
  console.log("=====================================");
  console.log("Network:", network.name);
  console.log("Deploying MediSeal contract...\n");

  // Get the first signer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance. Make sure you have enough ETH for deployment.\n");
  }

  // Get contract factory with explicit signer
  const MediSeal = await ethers.getContractFactory("MediSeal", deployer);
  
  // Deploy with explicit signer
  console.log("📦 Deploying contract...");
  const mediSeal = await MediSeal.connect(deployer).deploy();
  
  console.log("⏳ Deployment transaction sent, waiting for confirmation...");
  await mediSeal.waitForDeployment();
  
  const contractAddress = await mediSeal.getAddress();
  console.log("✅ MediSeal deployed to:", contractAddress);
  
  // Test contract functionality
  try {
    const owner = await mediSeal.owner();
    console.log("👤 Contract owner:", owner);
    
    // Register the deployer as a manufacturer
    console.log("\n🏭 Registering deployer as manufacturer...");
    await mediSeal.registerStakeholder(deployer.address, 0); // 0 = MANUFACTURER
    console.log("✅ Manufacturer registered successfully");
    
  } catch (error) {
    console.log("⚠️  Error during contract setup:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-info.json");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=====================================");
    console.log("Contract address:", address);
    console.log("\n📋 Next Steps:");
    console.log("- Use the contract address to interact with MediSeal");
    console.log("- Update your frontend/backend with the new contract address");
    console.log("- Verify the contract on Etherscan if deploying to testnet/mainnet");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("===================");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("- Check your account balance");
    console.error("- Ensure the network is accessible");
    console.error("- Verify the contract compiles successfully");
    process.exit(1);
  });