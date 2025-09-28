// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimplePinataStorage
 * @dev A simple contract to store Pinata CIDs on Polygon
 * @notice This contract only stores Pinata hashes and basic metadata
 */
contract SimplePinataStorage {
    // ============ STRUCTS ============
    
    struct PinataRecord {
        string pinataHash;      // IPFS hash from Pinata
        address uploader;       // Address of the uploader
        uint256 timestamp;      // Upload timestamp
        string fileName;        // Original file name
        uint256 fileSize;       // File size in bytes
    }

    // ============ STATE VARIABLES ============
    
    address public owner;
    uint256 public totalRecords;
    
    // Mappings
    mapping(uint256 => PinataRecord) public records;
    mapping(address => uint256[]) public userRecords;
    mapping(string => uint256) public pinataHashToRecordId;
    
    // ============ EVENTS ============
    
    event PinataStored(
        uint256 indexed recordId,
        address indexed uploader,
        string pinataHash,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "SimplePinataStorage: caller is not the owner");
        _;
    }
    
    modifier recordExists(uint256 recordId) {
        require(recordId > 0 && recordId <= totalRecords, "SimplePinataStorage: record does not exist");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        totalRecords = 0;
    }

    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Store a Pinata hash
     * @param pinataHash IPFS hash from Pinata
     * @param fileName Original file name
     * @param fileSize File size in bytes
     * @return recordId The ID of the stored record
     */
    function storePinataHash(
        string memory pinataHash,
        string memory fileName,
        uint256 fileSize
    ) external returns (uint256) {
        require(bytes(pinataHash).length > 0, "SimplePinataStorage: pinataHash cannot be empty");
        require(fileSize > 0, "SimplePinataStorage: fileSize must be greater than 0");
        
        // Check if pinataHash already exists
        require(pinataHashToRecordId[pinataHash] == 0, "SimplePinataStorage: pinataHash already exists");
        
        totalRecords++;
        uint256 recordId = totalRecords;
        
        records[recordId] = PinataRecord({
            pinataHash: pinataHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            fileName: fileName,
            fileSize: fileSize
        });
        
        userRecords[msg.sender].push(recordId);
        pinataHashToRecordId[pinataHash] = recordId;
        
        emit PinataStored(recordId, msg.sender, pinataHash, block.timestamp);
        
        return recordId;
    }
    
    /**
     * @dev Get record by ID
     * @param recordId ID of the record
     * @return PinataRecord The record data
     */
    function getRecord(uint256 recordId) external view recordExists(recordId) returns (PinataRecord memory) {
        return records[recordId];
    }
    
    /**
     * @dev Get all records uploaded by a user
     * @param user Address of the user
     * @return recordIds Array of record IDs
     */
    function getUserRecords(address user) external view returns (uint256[] memory) {
        return userRecords[user];
    }
    
    /**
     * @dev Get record ID by Pinata hash
     * @param pinataHash IPFS hash from Pinata
     * @return recordId The record ID
     */
    function getRecordIdByPinataHash(string memory pinataHash) external view returns (uint256) {
        return pinataHashToRecordId[pinataHash];
    }
    
    /**
     * @dev Get total number of records
     * @return count Total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return totalRecords;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SimplePinataStorage: new owner is the zero address");
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

