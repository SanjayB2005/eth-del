// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SafeGuardEvidenceEnhanced is ReentrancyGuard, Ownable, AccessControl {
    
    enum EmergencyLevel { LOW, MEDIUM, HIGH, CRITICAL }
    enum EvidenceType { DOCUMENT, AUDIO, VIDEO, IMAGE, TEXT, OTHER }
    enum EvidenceStatus { SUBMITTED, VERIFIED, UNDER_REVIEW, REJECTED, ARCHIVED }
    
    struct Evidence {
        bytes32 contentHash;
        bytes32 metadataHash;
        address submitter;
        uint256 timestamp;
        EmergencyLevel urgency;
        EvidenceType evidenceType;
        EvidenceStatus status;
        bool isEncrypted;
        bytes32 encryptionKeyHash;
        uint256 accessExpiry;
        string accessPurpose;
        mapping(address => bool) authorizedAccess;
    }
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant EMERGENCY_CONTACT_ROLE = keccak256("EMERGENCY_CONTACT_ROLE");
    
    mapping(bytes32 => Evidence) public evidenceStorage;
    mapping(address => bytes32[]) public userEvidence;
    mapping(address => bool) public emergencyContacts;
    
    uint256 public totalEvidence;
    uint256 public totalUsers;
    
    event EvidenceSubmitted(
        bytes32 indexed contentHash,
        address indexed submitter,
        EmergencyLevel urgency,
        EvidenceType evidenceType,
        uint256 timestamp
    );
    
    event AccessGranted(
        bytes32 indexed contentHash,
        address indexed grantee,
        address indexed granter,
        string purpose,
        uint256 expiry
    );
    
    event EmergencyTriggered(
        bytes32 indexed contentHash,
        address indexed submitter,
        EmergencyLevel urgency,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    function submitEvidence(
        bytes32 _contentHash,
        bytes32 _metadataHash,
        EmergencyLevel _urgency,
        EvidenceType _evidenceType,
        bool _isEncrypted,
        bytes32 _encryptionKeyHash
    ) external nonReentrant {
        require(_contentHash != bytes32(0), "Invalid hash");
        require(evidenceStorage[_contentHash].timestamp == 0, "Evidence already exists");
        
        Evidence storage evidence = evidenceStorage[_contentHash];
        evidence.contentHash = _contentHash;
        evidence.metadataHash = _metadataHash;
        evidence.submitter = msg.sender;
        evidence.timestamp = block.timestamp;
        evidence.urgency = _urgency;
        evidence.evidenceType = _evidenceType;
        evidence.status = EvidenceStatus.SUBMITTED;
        evidence.isEncrypted = _isEncrypted;
        evidence.encryptionKeyHash = _encryptionKeyHash;
        evidence.accessExpiry = 0;
        
        evidence.authorizedAccess[msg.sender] = true;
        userEvidence[msg.sender].push(_contentHash);
        
        totalEvidence++;
        totalUsers++;
        
        emit EvidenceSubmitted(
            _contentHash,
            msg.sender,
            _urgency,
            _evidenceType,
            block.timestamp
        );
        
        if (_urgency == EmergencyLevel.CRITICAL) {
            emit EmergencyTriggered(
                _contentHash,
                msg.sender,
                _urgency,
                block.timestamp
            );
        }
    }
    
    function grantAccess(
        bytes32 _contentHash,
        address _grantee,
        string calldata _purpose,
        uint256 _duration
    ) external {
        require(evidenceStorage[_contentHash].timestamp != 0, "Evidence not found");
        
        Evidence storage evidence = evidenceStorage[_contentHash];
        require(
            evidence.submitter == msg.sender || 
            hasRole(AUTHORITY_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to grant access"
        );
        
        evidence.authorizedAccess[_grantee] = true;
        evidence.accessExpiry = block.timestamp + _duration;
        evidence.accessPurpose = _purpose;
        
        emit AccessGranted(
            _contentHash,
            _grantee,
            msg.sender,
            _purpose,
            evidence.accessExpiry
        );
    }
    
    function checkUserAccess(bytes32 _contentHash, address _user) 
        external 
        view 
        returns (bool userHasAccess) 
    {
        if (_contentHash == bytes32(0)) return false;
        
        Evidence storage evidence = evidenceStorage[_contentHash];
        if (evidence.timestamp == 0) return false;
        
        if (evidence.submitter == _user) return true;
        if (hasRole(AUTHORITY_ROLE, _user)) return true;
        if (evidence.authorizedAccess[_user]) return true;
        
        return false;
    }
    
    function getContractStats() external view returns (
        uint256 totalEvidenceCount,
        uint256 totalUsersCount,
        uint256 activeEvidence
    ) {
        return (totalEvidence, totalUsers, totalEvidence);
    }
}