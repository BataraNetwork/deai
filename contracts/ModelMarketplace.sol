// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ModelMarketplace is Ownable {
    struct AIModel {
        bytes32 modelHash;
        string metadata;
        uint256 price;
        address creator;
    }

    mapping(bytes32 => AIModel) public models;

    event ModelRegistered(
        bytes32 indexed modelHash,
        address indexed creator,
        uint256 price
    );

    constructor() Ownable(msg.sender) {}

    function registerModel(
        bytes32 modelHash,
        string calldata metadata,
        uint256 price
    ) external {
        require(models[modelHash].creator == address(0), "Model already registered");

        models[modelHash] = AIModel(modelHash, metadata, price, msg.sender);

        emit ModelRegistered(modelHash, msg.sender, price);
    }

    function getModel(bytes32 modelHash) external view returns (AIModel memory) {
        require(models[modelHash].creator != address(0), "Model not found");
        return models[modelHash];
    }
}
