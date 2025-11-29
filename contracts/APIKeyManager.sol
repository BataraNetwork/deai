// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAuditLog {
    function addLog(address _user, string memory _eventDescription) external;
}

contract APIKeyManager is Ownable {
    struct Organization {
        string name;
        bool exists;
    }

    IAuditLog public auditLog;
    mapping(address => Organization) public organizations;
    mapping(bytes32 => address) public apiKeyToOrganization;

    event OrganizationRegistered(address indexed owner, string name);
    event ApiKeyAssigned(bytes32 apiKeyHash, address indexed organization);
    event AuditLogAddressUpdated(address indexed newAddress);

    modifier onlyRegisteredOrganization() {
        require(organizations[msg.sender].exists, "Organization not registered.");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
    }

    function setAuditLogAddress(address _auditLogAddress) public onlyOwner {
        auditLog = IAuditLog(_auditLogAddress);
        emit AuditLogAddressUpdated(_auditLogAddress);
    }

    function registerOrganization(string memory _name) public {
        require(!organizations[msg.sender].exists, "Organization already registered.");
        organizations[msg.sender] = Organization({ name: _name, exists: true });

        if (address(auditLog) != address(0)) {
            auditLog.addLog(msg.sender, "New organization registered");
        }

        emit OrganizationRegistered(msg.sender, _name);
    }

    function assignApiKey(bytes32 _apiKeyHash) public onlyRegisteredOrganization {
        require(apiKeyToOrganization[_apiKeyHash] == address(0), "API key already assigned.");
        apiKeyToOrganization[_apiKeyHash] = msg.sender;
        emit ApiKeyAssigned(_apiKeyHash, msg.sender);
    }

    function getOrganization(bytes32 _apiKeyHash) public view returns (address) {
        return apiKeyToOrganization[_apiKeyHash];
    }
}
