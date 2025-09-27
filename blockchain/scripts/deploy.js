const hre = require("hardhat");

async function main() {
  console.log("Deploying MediSealOptimized contract...");

  // Get the contract factory
  const MediSeal = await hre.ethers.getContractFactory("MediSealOptimized");
  
  // Deploy the contract with gas optimization
  const mediSeal = await MediSeal.deploy({
    gasLimit: 3000000 // Set gas limit to prevent out of gas errors
  });
  
  await mediSeal.waitForDeployment();
  
  const contractAddress = await mediSeal.getAddress();
  console.log("MediSealOptimized deployed to:", contractAddress);
  
  // Register some initial stakeholders for demo
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Register manufacturer (using new optimized function)
  await mediSeal.registerStakeholder(
    deployer.address,
    0 // MANUFACTURER
  );
  console.log("Registered manufacturer:", deployer.address);

  // Register a laboratory for testing
  const labAddress = "0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f"; // Fixed checksum
  await mediSeal.registerStakeholder(
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