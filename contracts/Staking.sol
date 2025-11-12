// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeAIToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    DeAIToken public deaiToken;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Stake) public stakes;
    uint256 public minimumStake;

    event Staked(address indexed node, uint256 amount);
    event Unstaked(address indexed node, uint256 amount);
    event Slashed(address indexed node, uint256 amount);

    constructor(address tokenAddress, uint256 _minimumStake) Ownable(msg.sender) {
        deaiToken = DeAIToken(tokenAddress);
        minimumStake = _minimumStake;
    }

    function stake() external {
        uint256 amount = deaiToken.balanceOf(msg.sender);
        require(amount >= minimumStake, "Not enough tokens to stake");

        stakes[msg.sender] = Stake(amount, block.timestamp);
        deaiToken.transferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        Stake memory stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No stake found");

        // Add a time lock for unstaking if needed

        stakes[msg.sender] = Stake(0, 0);
        deaiToken.transfer(msg.sender, stakeInfo.amount);

        emit Unstaked(msg.sender, stakeInfo.amount);
    }

    function slash(address node, uint256 amount) external onlyOwner {
        Stake memory stakeInfo = stakes[node];
        require(stakeInfo.amount > 0, "No stake found");
        require(amount <= stakeInfo.amount, "Amount exceeds stake");

        stakeInfo.amount -= amount;

        emit Slashed(node, amount);
    }

    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
    }
}
