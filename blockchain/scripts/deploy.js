const hre = require("hardhat");

async function main() {
  console.log("Deploying PharmaChainOptimized contract...");

  // Get the contract factory
  const PharmaChain = await hre.ethers.getContractFactory("PharmaChainOptimized");
  
  // Deploy the contract with gas optimization
  const pharmaChain = await PharmaChain.deploy({
    gasLimit: 3000000 // Set gas limit to prevent out of gas errors
  });
  
  await pharmaChain.waitForDeployment();
  
  const contractAddress = await pharmaChain.getAddress();
  console.log("PharmaChainOptimized deployed to:", contractAddress);
  
  // Register some initial stakeholders for demo
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Register manufacturer (using new optimized function)
  await pharmaChain.registerStakeholder(
    deployer.address,
    0 // MANUFACTURER
  );
  console.log("Registered manufacturer:", deployer.address);

  // Register a laboratory for testing
  const labAddress = "0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f"; // Fixed checksum
  await pharmaChain.registerStakeholder(
    labAddress,
    5 // LABORATORY
  );
  console.log("Registered laboratory:", labAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("Deployment completed successfully!");
  console.log("Deployment info:", deploymentInfo);
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });