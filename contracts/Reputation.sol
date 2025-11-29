// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Reputation is Ownable {
    mapping(address => uint256) public reputations;

    event ReputationUpdated(address target, uint256 newReputation);

    constructor() {
        // The deployer of the contract is the owner
        _transferOwnership(msg.sender);
    }

    function updateReputation(address _target, uint256 _newReputation) public onlyOwner {
        reputations[_target] = _newReputation;
        emit ReputationUpdated(_target, _newReputation);
    }
    
    function increaseReputation(address _target, uint256 _amount) public onlyOwner {
        reputations[_target] += _amount;
        emit ReputationUpdated(_target, reputations[_target]);
    }

    function decreaseReputation(address _target, uint256 _amount) public onlyOwner {
        if (reputations[_target] >= _amount) {
            reputations[_target] -= _amount;
        } else {
            reputations[_target] = 0;
        }
        emit ReputationUpdated(_target, reputations[_target]);
    }

    function getReputation(address _target) public view returns (uint256) {
        return reputations[_target];
    }
}
