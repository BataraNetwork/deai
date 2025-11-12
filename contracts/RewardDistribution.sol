// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeAIToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardDistribution is Ownable {
    DeAIToken public deaiToken;

    event RewardDistributed(address indexed node, uint256 amount);

    constructor(address tokenAddress) Ownable(msg.sender) {
        deaiToken = DeAIToken(tokenAddress);
    }

    function distributeReward(address node, uint256 computeTime, uint256 requestValue) external onlyOwner {
        // Reward calculation logic (can be more complex)
        uint256 reward = computeTime * requestValue;
        deaiToken.mint(node, reward);

        emit RewardDistributed(node, reward);
    }
}
