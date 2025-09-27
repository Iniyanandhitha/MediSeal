const { ethers } = require("hardhat");

async function main() {
  console.log("Starting MediSeal deployment...");

  try {
    // Deploy the contract
    const MediSeal = await ethers.getContractFactory("MediSeal");
    console.log("Got contract factory");
    
    const mediSeal = await MediSeal.deploy();
    console.log("Contract deployment initiated...");
    
    await mediSeal.waitForDeployment();
    console.log("Contract deployed successfully!");
    
    const address = await mediSeal.getAddress();
    console.log("MediSeal contract deployed to:", address);
    
  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });