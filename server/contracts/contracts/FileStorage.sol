// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FileStorage
 * @dev A smart contract for storing file metadata on Polygon blockchain
 * @notice This contract stores Pinata hashes and Filecoin storage details
 */
contract FileStorage {
    // ============ STRUCTS ============
    
    struct FileRecord {
        string pinataHash;      // IPFS hash from Pinata
        string pieceCid;        // Filecoin Piece CID
        string dealId;          // Filecoin Deal ID
        string provider;        // Filecoin storage provider
        address uploader;       // Address of the uploader
        uint256 fileSize;       // File size in bytes
        uint256 timestamp;      // Upload timestamp
        bool isActive;          // Whether the record is active
        string fileName;        // Original file name
        string fileType;        // MIME type
    }

    // ============ STATE VARIABLES ============
    
    address public owner;
    uint256 public totalFiles;
    uint256 public totalStorageUsed;
    
    // Mappings
    mapping(uint256 => FileRecord) public files;
    mapping(address => uint256[]) public userFiles;
    mapping(string => uint256) public pinataHashToFileId;
    
    // ============ EVENTS ============
    
    event FileStored(
        uint256 indexed fileId,
        address indexed uploader,
        string pinataHash,
        string pieceCid,
        string dealId,
        uint256 timestamp
    );
    
    event FileUpdated(
        uint256 indexed fileId,
        address indexed updater,
        string newPinataHash
    );
    
    event FileDeactivated(
        uint256 indexed fileId,
        address indexed deactivator
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "FileStorage: caller is not the owner");
        _;
    }
    
    modifier fileExists(uint256 fileId) {
        require(fileId > 0 && fileId <= totalFiles, "FileStorage: file does not exist");
        _;
    }
    
    modifier onlyFileOwner(uint256 fileId) {
        require(files[fileId].uploader == msg.sender, "FileStorage: not the file owner");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        totalFiles = 0;
        totalStorageUsed = 0;
    }

    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Store a new file record
     * @param pinataHash IPFS hash from Pinata
     * @param pieceCid Filecoin Piece CID
     * @param dealId Filecoin Deal ID
     * @param provider Filecoin storage provider
     * @param fileSize File size in bytes
     * @param fileName Original file name
     * @param fileType MIME type
     * @return fileId The ID of the stored file
     */
    function storeFile(
        string memory pinataHash,
        string memory pieceCid,
        string memory dealId,
        string memory provider,
        uint256 fileSize,
        string memory fileName,
        string memory fileType
    ) external returns (uint256) {
        require(bytes(pinataHash).length > 0, "FileStorage: pinataHash cannot be empty");
        require(bytes(pieceCid).length > 0, "FileStorage: pieceCid cannot be empty");
        require(fileSize > 0, "FileStorage: fileSize must be greater than 0");
        
        // Check if pinataHash already exists
        require(pinataHashToFileId[pinataHash] == 0, "FileStorage: pinataHash already exists");
        
        totalFiles++;
        uint256 fileId = totalFiles;
        
        files[fileId] = FileRecord({
            pinataHash: pinataHash,
            pieceCid: pieceCid,
            dealId: dealId,
            provider: provider,
            uploader: msg.sender,
            fileSize: fileSize,
            timestamp: block.timestamp,
            isActive: true,
            fileName: fileName,
            fileType: fileType
        });
        
        userFiles[msg.sender].push(fileId);
        pinataHashToFileId[pinataHash] = fileId;
        totalStorageUsed += fileSize;
        
        emit FileStored(fileId, msg.sender, pinataHash, pieceCid, dealId, block.timestamp);
        
        return fileId;
    }
    
    /**
     * @dev Update an existing file record
     * @param fileId ID of the file to update
     * @param newPinataHash New IPFS hash
     * @param newPieceCid New Piece CID
     * @param newDealId New Deal ID
     */
    function updateFile(
        uint256 fileId,
        string memory newPinataHash,
        string memory newPieceCid,
        string memory newDealId
    ) external fileExists(fileId) onlyFileOwner(fileId) {
        require(bytes(newPinataHash).length > 0, "FileStorage: newPinataHash cannot be empty");
        require(files[fileId].isActive, "FileStorage: file is not active");
        
        // Remove old pinataHash mapping
        pinataHashToFileId[files[fileId].pinataHash] = 0;
        
        // Update file record
        files[fileId].pinataHash = newPinataHash;
        files[fileId].pieceCid = newPieceCid;
        files[fileId].dealId = newDealId;
        
        // Add new pinataHash mapping
        pinataHashToFileId[newPinataHash] = fileId;
        
        emit FileUpdated(fileId, msg.sender, newPinataHash);
    }
    
    /**
     * @dev Deactivate a file record
     * @param fileId ID of the file to deactivate
     */
    function deactivateFile(uint256 fileId) external fileExists(fileId) onlyFileOwner(fileId) {
        require(files[fileId].isActive, "FileStorage: file is already inactive");
        
        files[fileId].isActive = false;
        totalStorageUsed -= files[fileId].fileSize;
        
        emit FileDeactivated(fileId, msg.sender);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get file record by ID
     * @param fileId ID of the file
     * @return FileRecord The file record
     */
    function getFile(uint256 fileId) external view fileExists(fileId) returns (FileRecord memory) {
        return files[fileId];
    }
    
    /**
     * @dev Get all files uploaded by a user
     * @param user Address of the user
     * @return fileIds Array of file IDs
     */
    function getUserFiles(address user) external view returns (uint256[] memory) {
        return userFiles[user];
    }
    
    /**
     * @dev Get file ID by Pinata hash
     * @param pinataHash IPFS hash from Pinata
     * @return fileId The file ID
     */
    function getFileIdByPinataHash(string memory pinataHash) external view returns (uint256) {
        return pinataHashToFileId[pinataHash];
    }
    
    /**
     * @dev Get total number of files
     * @return count Total number of files
     */
    function getTotalFiles() external view returns (uint256) {
        return totalFiles;
    }
    
    /**
     * @dev Get total storage used
     * @return storage Total storage used in bytes
     */
    function getTotalStorageUsed() external view returns (uint256) {
        return totalStorageUsed;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "FileStorage: new owner is the zero address");
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @dev Emergency function to deactivate any file (owner only)
     * @param fileId ID of the file to deactivate
     */
    function emergencyDeactivateFile(uint256 fileId) external onlyOwner fileExists(fileId) {
        if (files[fileId].isActive) {
            files[fileId].isActive = false;
            totalStorageUsed -= files[fileId].fileSize;
            emit FileDeactivated(fileId, msg.sender);
        }
    }
}

