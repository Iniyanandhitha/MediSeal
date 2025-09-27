// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PharmaChainOptimized
 * @dev Gas-optimized NFT-based pharmaceutical supply chain with Laboratory support
 * Each NFT represents a unique batch of medicine with complete traceability
 */
contract PharmaChainOptimized is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Packed enums for gas efficiency (uint8)
    enum StakeholderRole { 
        MANUFACTURER,    // 0
        DISTRIBUTOR,     // 1 
        RETAILER,        // 2
        HEALTHCARE_PROVIDER, // 3
        REGULATOR,       // 4
        LABORATORY       // 5 - NEW: For uploading testing certificates
    }
    
    enum BatchStatus { 
        MANUFACTURED,    // 0
        TESTED,         // 1 - NEW: Laboratory tested
        IN_TRANSIT,     // 2
        DELIVERED,      // 3
        DISPENSED,      // 4
        RECALLED        // 5
    }
    
    // Optimized struct with packed variables to save gas
    struct BatchInfo {
        uint128 tokenId;         // Reduced from uint256
        uint64 manufacturingDate; // Reduced from uint256  
        uint64 expiryDate;       // Reduced from uint256
        address manufacturer;     // 20 bytes
        uint32 quantity;         // Reduced from uint256
        BatchStatus status;      // uint8
        bool isActive;          // 1 bit
    }
    
    // Simplified stakeholder struct
    struct Stakeholder {
        StakeholderRole role;    // uint8
        bool isVerified;        // 1 bit
        uint64 registrationDate; // Reduced from uint256
    }
    
    // Simplified transfer record
    struct TransferRecord {
        address from;
        address to; 
        uint64 timestamp;       // Reduced from uint256
    }
    
    // Gas-efficient mappings
    mapping(uint256 => BatchInfo) public batches;
    mapping(address => Stakeholder) public stakeholders;
    mapping(uint256 => TransferRecord[]) public transferHistory;
    mapping(bytes32 => uint256) public batchHashToTokenId; // Using hash instead of string
    mapping(bytes32 => bool) public batchHashExists;
    mapping(bytes32 => uint256) public qrHashToTokenId; // Using hash for QR codes
    
    // Laboratory testing mappings
    mapping(uint256 => mapping(address => bool)) public labTestResults; // tokenId => lab => passed
    mapping(uint256 => address[]) public testedByLabs; // Track which labs tested each batch
    
    // Events (optimized with indexed parameters)
    event BatchMinted(uint256 indexed tokenId, bytes32 indexed batchHash, address indexed manufacturer);
    event BatchTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event StakeholderRegistered(address indexed stakeholder, StakeholderRole role);
    event BatchStatusUpdated(uint256 indexed tokenId, BatchStatus newStatus);
    event BatchTested(uint256 indexed tokenId, address indexed laboratory, bool passed);
    event BatchRecalled(uint256 indexed tokenId);
    
    // Gas-efficient modifiers
    modifier onlyVerifiedStakeholder() {
        require(stakeholders[msg.sender].isVerified, "Not verified");
        _;
    }
    
    modifier onlyRole(StakeholderRole _role) {
        require(stakeholders[msg.sender].role == _role && stakeholders[msg.sender].isVerified, "Invalid role");
        _;
    }
    
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _;
    }
    
    modifier validToken(uint256 tokenId) {
        require(tokenId < _tokenIdCounter && batches[tokenId].isActive, "Invalid token");
        _;
    }
    
    constructor() ERC721("PharmaChainOptimized", "PHARMAV2") Ownable(msg.sender) {}
    
    /**
     * @dev Register stakeholder (gas optimized)
     */
    function registerStakeholder(
        address _stakeholder,
        StakeholderRole _role
    ) external onlyOwner {
        require(_stakeholder != address(0), "Invalid address");
        
        stakeholders[_stakeholder] = Stakeholder({
            role: _role,
            isVerified: true,
            registrationDate: uint64(block.timestamp)
        });
        
        emit StakeholderRegistered(_stakeholder, _role);
    }
    
    /**
     * @dev Mint batch (gas optimized)
     */
    function mintBatch(
        bytes32 _batchHash,
        uint64 _expiryDate,
        uint32 _quantity,
        bytes32 _qrHash
    ) external onlyRole(StakeholderRole.MANUFACTURER) returns (uint256) {
        require(_expiryDate > block.timestamp, "Invalid expiry");
        require(_quantity > 0, "Invalid quantity");
        require(!batchHashExists[_batchHash], "Batch exists");
        require(qrHashToTokenId[_qrHash] == 0, "QR used");
        
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        batches[tokenId] = BatchInfo({
            tokenId: uint128(tokenId),
            manufacturingDate: uint64(block.timestamp),
            expiryDate: _expiryDate,
            manufacturer: msg.sender,
            quantity: _quantity,
            status: BatchStatus.MANUFACTURED,
            isActive: true
        });
        
        batchHashToTokenId[_batchHash] = tokenId;
        batchHashExists[_batchHash] = true;
        qrHashToTokenId[_qrHash] = tokenId;
        
        emit BatchMinted(tokenId, _batchHash, msg.sender);
        return tokenId;
    }
    
    /**
     * @dev Laboratory testing function (NEW)
     */
    function submitTestResult(
        uint256 _tokenId,
        bool _passed
    ) external onlyRole(StakeholderRole.LABORATORY) validToken(_tokenId) {
        require(!labTestResults[_tokenId][msg.sender], "Already tested");
        
        labTestResults[_tokenId][msg.sender] = _passed;
        testedByLabs[_tokenId].push(msg.sender);
        
        // Update status to TESTED if passed
        if (_passed && batches[_tokenId].status == BatchStatus.MANUFACTURED) {
            batches[_tokenId].status = BatchStatus.TESTED;
            emit BatchStatusUpdated(_tokenId, BatchStatus.TESTED);
        }
        
        emit BatchTested(_tokenId, msg.sender, _passed);
    }
    
    /**
     * @dev Transfer batch (gas optimized)
     */
    function transferBatch(
        uint256 _tokenId,
        address _to
    ) external onlyTokenOwner(_tokenId) onlyVerifiedStakeholder validToken(_tokenId) {
        require(stakeholders[_to].isVerified, "Recipient not verified");
        
        address from = ownerOf(_tokenId);
        
        // Record transfer (simplified)
        transferHistory[_tokenId].push(TransferRecord({
            from: from,
            to: _to,
            timestamp: uint64(block.timestamp)
        }));
        
        // Update status
        if (batches[_tokenId].status != BatchStatus.RECALLED) {
            batches[_tokenId].status = BatchStatus.IN_TRANSIT;
            emit BatchStatusUpdated(_tokenId, BatchStatus.IN_TRANSIT);
        }
        
        _transfer(from, _to, _tokenId);
        emit BatchTransferred(_tokenId, from, _to);
    }
    
    /**
     * @dev Update batch status (gas optimized)
     */
    function updateBatchStatus(
        uint256 _tokenId, 
        BatchStatus _newStatus
    ) external onlyTokenOwner(_tokenId) validToken(_tokenId) {
        batches[_tokenId].status = _newStatus;
        emit BatchStatusUpdated(_tokenId, _newStatus);
    }
    
    /**
     * @dev Recall batch (emergency)
     */
    function recallBatch(uint256 _tokenId) external validToken(_tokenId) {
        require(
            msg.sender == batches[_tokenId].manufacturer || 
            msg.sender == owner() ||
            stakeholders[msg.sender].role == StakeholderRole.REGULATOR,
            "Not authorized"
        );
        
        batches[_tokenId].status = BatchStatus.RECALLED;
        emit BatchRecalled(_tokenId);
    }
    
    /**
     * @dev Verify by QR hash (gas optimized)
     */
    function verifyByQRHash(bytes32 _qrHash) external view returns (
        bool isValid,
        uint256 tokenId,
        BatchStatus status,
        address currentOwner
    ) {
        tokenId = qrHashToTokenId[_qrHash];
        if (tokenId == 0 || !batches[tokenId].isActive) {
            return (false, 0, BatchStatus.MANUFACTURED, address(0));
        }
        
        return (true, tokenId, batches[tokenId].status, ownerOf(tokenId));
    }
    
    /**
     * @dev Get batch info (gas optimized)
     */
    function getBatchInfo(uint256 _tokenId) external view validToken(_tokenId) returns (BatchInfo memory) {
        return batches[_tokenId];
    }
    
    /**
     * @dev Get laboratory test results for a batch
     */
    function getLabTestResults(uint256 _tokenId) external view validToken(_tokenId) returns (
        address[] memory labs,
        bool[] memory results
    ) {
        labs = testedByLabs[_tokenId];
        results = new bool[](labs.length);
        
        for (uint i = 0; i < labs.length; i++) {
            results[i] = labTestResults[_tokenId][labs[i]];
        }
    }
    
    /**
     * @dev Get transfer history (gas optimized)
     */
    function getTransferHistory(uint256 _tokenId) external view validToken(_tokenId) returns (TransferRecord[] memory) {
        return transferHistory[_tokenId];
    }
    
    /**
     * @dev Get stakeholder info
     */
    function getStakeholder(address _stakeholder) external view returns (Stakeholder memory) {
        return stakeholders[_stakeholder];
    }
    
    /**
     * @dev Get total batches
     */
    function getTotalBatches() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Emergency deactivate batch (owner only)
     */
    function deactivateBatch(uint256 _tokenId) external onlyOwner {
        batches[_tokenId].isActive = false;
    }
    
    /**
     * @dev Batch registration of multiple stakeholders (gas efficient)
     */
    function batchRegisterStakeholders(
        address[] calldata _stakeholders,
        StakeholderRole[] calldata _roles
    ) external onlyOwner {
        require(_stakeholders.length == _roles.length, "Length mismatch");
        
        for (uint i = 0; i < _stakeholders.length; i++) {
            stakeholders[_stakeholders[i]] = Stakeholder({
                role: _roles[i],
                isVerified: true,
                registrationDate: uint64(block.timestamp)
            });
            
            emit StakeholderRegistered(_stakeholders[i], _roles[i]);
        }
    }
}
