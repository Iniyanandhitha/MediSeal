const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MediSeal", function () {
  let mediSeal;
  let owner;
  let manufacturer;
  let distributor;
  let retailer;
  let consumer;

  beforeEach(async function () {
    // Get signers
    [owner, manufacturer, distributor, retailer, consumer] = await ethers.getSigners();

    // Deploy the contract
    const MediSeal = await ethers.getContractFactory("MediSealOptimized");
    mediSeal = await MediSeal.deploy();
    await mediSeal.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mediSeal.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await mediSeal.name()).to.equal("MediSealOptimized");
      expect(await mediSeal.symbol()).to.equal("MEDISEAL");
    });
  });

  describe("Stakeholder Registration", function () {
    it("Should register a manufacturer", async function () {
      await mediSeal.registerStakeholder(
        manufacturer.address,
        "PharmaCorp",
        "MFG-001",
        0 // MANUFACTURER
      );

      const stakeholder = await mediSeal.getStakeholder(manufacturer.address);
      expect(stakeholder.name).to.equal("PharmaCorp");
      expect(stakeholder.role).to.equal(0);
      expect(stakeholder.isVerified).to.be.true;
    });

    it("Should register a distributor", async function () {
      await mediSeal.registerStakeholder(
        distributor.address,
        "MedDistributor",
        "DIST-001",
        1 // DISTRIBUTOR
      );

      const stakeholder = await mediSeal.getStakeholder(distributor.address);
      expect(stakeholder.name).to.equal("MedDistributor");
      expect(stakeholder.role).to.equal(1);
    });

    it("Should only allow owner to register stakeholders", async function () {
      await expect(
        mediSeal.connect(manufacturer).registerStakeholder(
          retailer.address,
          "Pharmacy",
          "RET-001",
          2 // RETAILER
        )
      ).to.be.revertedWithCustomError(mediSeal, "OwnableUnauthorizedAccount");
    });
  });

  describe("Batch Minting", function () {
    beforeEach(async function () {
      // Register manufacturer first
      await mediSeal.registerStakeholder(
        manufacturer.address,
        "PharmaCorp",
        "MFG-001",
        0 // MANUFACTURER
      );
    });

    it("Should mint a new batch", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
      
      await expect(
        mediSeal.connect(manufacturer).mintBatch(
          "Aspirin",
          "BATCH-001",
          expiryDate,
          1000,
          "QmTestHash123",
          "QR-HASH-001",
          "https://ipfs.io/ipfs/QmTestHash123"
        )
      ).to.emit(mediSeal, "BatchMinted")
       .withArgs(0, "Aspirin", "BATCH-001", manufacturer.address);
    });

    it("Should not allow non-manufacturers to mint", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      
      await expect(
        mediSeal.connect(distributor).mintBatch(
          "Aspirin",
          "BATCH-001",
          expiryDate,
          1000,
          "QmTestHash123",
          "QR-HASH-001",
          "https://ipfs.io/ipfs/QmTestHash123"
        )
      ).to.be.revertedWith("Only verified manufacturers can perform this action");
    });

    it("Should not allow duplicate batch numbers", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      
      // First mint
      await mediSeal.connect(manufacturer).mintBatch(
        "Aspirin",
        "BATCH-001",
        expiryDate,
        1000,
        "QmTestHash123",
        "QR-HASH-001",
        "https://ipfs.io/ipfs/QmTestHash123"
      );

      // Second mint with same batch number should fail
      await expect(
        mediSeal.connect(manufacturer).mintBatch(
          "Tylenol",
          "BATCH-001",
          expiryDate,
          500,
          "QmTestHash456",
          "QR-HASH-002",
          "https://ipfs.io/ipfs/QmTestHash456"
        )
      ).to.be.revertedWith("Batch number already exists");
    });
  });

  describe("Batch Transfer", function () {
    let tokenId;

    beforeEach(async function () {
      // Register stakeholders
      await mediSeal.registerStakeholder(
        manufacturer.address,
        "PharmaCorp",
        "MFG-001",
        0 // MANUFACTURER
      );
      
      await mediSeal.registerStakeholder(
        distributor.address,
        "MedDistributor",
        "DIST-001",
        1 // DISTRIBUTOR
      );

      // Mint a batch
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await mediSeal.connect(manufacturer).mintBatch(
        "Aspirin",
        "BATCH-001",
        expiryDate,
        1000,
        "QmTestHash123",
        "QR-HASH-001",
        "https://ipfs.io/ipfs/QmTestHash123"
      );
      tokenId = 0;
    });

    it("Should transfer batch to distributor", async function () {
      await expect(
        mediSeal.connect(manufacturer).transferBatch(
          tokenId,
          distributor.address,
          "Warehouse A",
          "Refrigerated transport"
        )
      ).to.emit(mediSeal, "BatchTransferred")
       .withArgs(tokenId, manufacturer.address, distributor.address, "Warehouse A");

      expect(await mediSeal.ownerOf(tokenId)).to.equal(distributor.address);
    });

    it("Should record transfer history", async function () {
      await mediSeal.connect(manufacturer).transferBatch(
        tokenId,
        distributor.address,
        "Warehouse A",
        "Refrigerated transport"
      );

      const history = await mediSeal.getTransferHistory(tokenId);
      expect(history.length).to.equal(1);
      expect(history[0].from).to.equal(manufacturer.address);
      expect(history[0].to).to.equal(distributor.address);
      expect(history[0].location).to.equal("Warehouse A");
    });

    it("Should only allow token owner to transfer", async function () {
      await expect(
        mediSeal.connect(distributor).transferBatch(
          tokenId,
          retailer.address,
          "Pharmacy",
          "Standard transport"
        )
      ).to.be.revertedWith("Not the token owner");
    });
  });

  describe("QR Code Verification", function () {
    beforeEach(async function () {
      // Register manufacturer
      await mediSeal.registerStakeholder(
        manufacturer.address,
        "PharmaCorp",
        "MFG-001",
        0 // MANUFACTURER
      );

      // Mint a batch
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await mediSeal.connect(manufacturer).mintBatch(
        "Aspirin",
        "BATCH-001",
        expiryDate,
        1000,
        "QmTestHash123",
        "QR-HASH-001",
        "https://ipfs.io/ipfs/QmTestHash123"
      );
    });

    it("Should verify valid QR code", async function () {
      const result = await mediSeal.verifyByQRCode("QR-HASH-001");
      
      expect(result.isValid).to.be.true;
      expect(result.tokenId).to.equal(0);
      expect(result.drugName).to.equal("Aspirin");
      expect(result.batchNumber).to.equal("BATCH-001");
      expect(result.currentOwner).to.equal(manufacturer.address);
    });

    it("Should return false for invalid QR code", async function () {
      const result = await mediSeal.verifyByQRCode("INVALID-QR");
      
      expect(result.isValid).to.be.false;
      expect(result.tokenId).to.equal(0);
      expect(result.drugName).to.equal("");
    });
  });

  describe("Batch Recall", function () {
    let tokenId;

    beforeEach(async function () {
      // Register manufacturer
      await mediSeal.registerStakeholder(
        manufacturer.address,
        "PharmaCorp",
        "MFG-001",
        0 // MANUFACTURER
      );

      // Mint a batch
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await mediSeal.connect(manufacturer).mintBatch(
        "Aspirin",
        "BATCH-001",
        expiryDate,
        1000,
        "QmTestHash123",
        "QR-HASH-001",
        "https://ipfs.io/ipfs/QmTestHash123"
      );
      tokenId = 0;
    });

    it("Should allow manufacturer to recall batch", async function () {
      await expect(
        mediSeal.connect(manufacturer).recallBatch(tokenId, "Quality issue detected")
      ).to.emit(mediSeal, "BatchRecalled")
       .withArgs(tokenId, "Quality issue detected");

      const batchInfo = await mediSeal.getBatchInfo(tokenId);
      expect(batchInfo.status).to.equal(4); // RECALLED
    });

    it("Should allow owner to recall batch", async function () {
      await expect(
        mediSeal.connect(owner).recallBatch(tokenId, "Regulatory recall")
      ).to.emit(mediSeal, "BatchRecalled")
       .withArgs(tokenId, "Regulatory recall");
    });

    it("Should not allow unauthorized recall", async function () {
      await expect(
        mediSeal.connect(consumer).recallBatch(tokenId, "Unauthorized recall")
      ).to.be.revertedWith("Not authorized to recall batch");
    });
  });
});
