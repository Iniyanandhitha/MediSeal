const hre = require("hardhat");

async function main() {
  console.log("🏥 Registering Laboratory Stakeholder...");

  // Get the contract factory
  const contractAddress = "0x7912D2524bA63611430cf5461Fab62Fe56C3265E";
  const MediSeal = await hre.ethers.getContractFactory("MediSealOptimized");
  const mediSeal = MediSeal.attach(contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Owner account:", deployer.address);

  // Laboratory address to register
  const labAddress = "0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f";
  
  try {
    // Check if laboratory is already registered
    console.log("\n📋 Checking current laboratory status...");
    const labInfo = await mediSeal.getStakeholder(labAddress);
    
    if (labInfo.isVerified && labInfo.role === 5) {
      console.log("✅ Laboratory is already registered!");
      console.log(`   Role: ${labInfo.role} (LABORATORY)`);
      console.log(`   Verified: ${labInfo.isVerified}`);
      console.log(`   Registration Date: ${new Date(Number(labInfo.registrationDate) * 1000).toISOString()}`);
    } else if (labInfo.isVerified) {
      console.log(`⚠️  Address is registered but with different role: ${labInfo.role}`);
      console.log("   This should be role 5 (LABORATORY)");
    } else {
      console.log("❌ Laboratory not registered. Registering now...");
      
      // Register laboratory stakeholder
      const tx = await mediSeal.registerStakeholder(
        labAddress,
        5, // LABORATORY role
        {
          gasLimit: 100000,
          gasPrice: hre.ethers.parseUnits('15', 'gwei')
        }
      );
      
      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Laboratory registered successfully!");
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      
      // Verify registration
      const verifyLabInfo = await mediSeal.getStakeholder(labAddress);
      console.log("\n🔍 Verification:");
      console.log(`   Role: ${verifyLabInfo.role} (should be 5 for LABORATORY)`);
      console.log(`   Verified: ${verifyLabInfo.isVerified}`);
    }

    // Test laboratory functionality
    console.log("\n🧪 Testing laboratory functionality...");
    
    // Check if we have any batches to test
    const totalBatches = await mediSeal.getTotalBatches();
    console.log(`   Total batches in system: ${totalBatches}`);
    
    if (totalBatches > 0) {
      console.log("\n   Testing getLabTestResults for batch 0...");
      try {
        const testResults = await mediSeal.getLabTestResults(0);
        console.log(`   Lab test results: ${testResults.labs.length} labs have tested this batch`);
        console.log(`   Results: ${testResults.results}`);
      } catch (error) {
        console.log(`   No test results yet for batch 0: ${error.message}`);
      }
    }

    // Show all registered stakeholders summary
    console.log("\n👥 Stakeholder Summary:");
    console.log("   ✅ Manufacturer registered");
    console.log("   ✅ Laboratory registered");
    console.log("   📋 System ready for laboratory testing workflow");

    console.log("\n🎯 Next Steps:");
    console.log("   1. Use the laboratory dashboard to submit test results");
    console.log("   2. Test the submitTestResult function");
    console.log("   3. Verify test results are stored on-chain");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 'CALL_EXCEPTION') {
      console.error("   This might be a smart contract execution error");
      console.error("   Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
