// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract DAO is Governor, GovernorVotes, GovernorCountingSimple, GovernorVotesQuorumFraction {
    constructor(
        IVotes _token
    ) 
        Governor("DeAIDAO")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {
        _transferOwnership(msg.sender);
    }

    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 block
    }

    function votingPeriod() public pure override returns (uint256) {
        return 45818; // 1 week in blocks (assuming 15s blocks)
    }

    // The following functions are overrides required by Solidity.
    function quorum(uint256 blockNumber) 
        public 
        view 
        override(Governor, GovernorVotesQuorumFraction) 
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }
}
