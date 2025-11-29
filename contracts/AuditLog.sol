// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditLog is Ownable {
    struct LogEntry {
        uint256 timestamp;
        address originContract;
        address user;
        string eventDescription;
    }

    LogEntry[] public logs;
    mapping(address => bool) public canLog;

    event LogRecorded(uint256 timestamp, address indexed originContract, address indexed user, string eventDescription);
    event LoggerPermissionChanged(address indexed logger, bool canLog);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function setLoggerPermission(address _logger, bool _canLog) public onlyOwner {
        canLog[_logger] = _canLog;
        emit LoggerPermissionChanged(_logger, _canLog);
    }

    function addLog(address _user, string memory _eventDescription) public {
        require(canLog[msg.sender], "AuditLog: Caller does not have permission to log");
        logs.push(LogEntry({
            timestamp: block.timestamp,
            originContract: msg.sender,
            user: _user,
            eventDescription: _eventDescription
        }));
        emit LogRecorded(block.timestamp, msg.sender, _user, _eventDescription);
    }

    function getLogsCount() public view returns (uint256) {
        return logs.length;
    }
}
