// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAPIKeyManager {
    function organizations(address) external view returns (string memory name, bool exists);
}

contract PrivateSubnet is Ownable {
    IAPIKeyManager public apiKeyManager;

    struct Subnet {
        address owner;
        string name;
        mapping(address => bool) nodes;
        address[] nodeList;
    }

    mapping(address => Subnet) public subnets;
    mapping(address => bool) public isNodeInSubnet;

    event SubnetCreated(address indexed owner, string name);
    event NodeAdded(address indexed subnetOwner, address indexed node);
    event NodeRemoved(address indexed subnetOwner, address indexed node);

    constructor(address _apiKeyManagerAddress) {
        apiKeyManager = IAPIKeyManager(_apiKeyManagerAddress);
        _transferOwnership(msg.sender);
    }

    function createSubnet(string memory _name) public {
        // Check if the caller is a registered organization in APIKeyManager
        (, bool exists) = apiKeyManager.organizations(msg.sender);
        require(exists, "PrivateSubnet: Caller is not a registered organization");
        require(subnets[msg.sender].owner == address(0), "PrivateSubnet: Subnet already exists for this organization");

        subnets[msg.sender].owner = msg.sender;
        subnets[msg.sender].name = _name;
        
        emit SubnetCreated(msg.sender, _name);
    }

    function addNode(address _node) public {
        require(subnets[msg.sender].owner != address(0), "PrivateSubnet: No subnet for this organization");
        require(!subnets[msg.sender].nodes[_node], "PrivateSubnet: Node already in subnet");
        require(!isNodeInSubnet[_node], "PrivateSubnet: Node already belongs to another subnet");

        subnets[msg.sender].nodes[_node] = true;
        subnets[msg.sender].nodeList.push(_node);
        isNodeInSubnet[_node] = true;
        
        emit NodeAdded(msg.sender, _node);
    }
    
    function removeNode(address _node) public {
        require(subnets[msg.sender].owner != address(0), "PrivateSubnet: No subnet for this organization");
        require(subnets[msg.sender].nodes[_node], "PrivateSubnet: Node not in subnet");

        subnets[msg.sender].nodes[_node] = false;
        isNodeInSubnet[_node] = false; // The node is now free

        for (uint i = 0; i < subnets[msg.sender].nodeList.length; i++) {
            if (subnets[msg.sender].nodeList[i] == _node) {
                subnets[msg.sender].nodeList[i] = subnets[msg.sender].nodeList[subnets[msg.sender].nodeList.length - 1];
                subnets[msg.sender].nodeList.pop();
                break;
            }
        }
        
        emit NodeRemoved(msg.sender, _node);
    }

    function getNodes() public view returns (address[] memory) {
        require(subnets[msg.sender].owner != address(0), "PrivateSubnet: No subnet for this organization");
        return subnets[msg.sender].nodeList;
    }
}
