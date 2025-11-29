// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract QuadraticVoting is Ownable {
    IERC20 public token;

    struct Proposal {
        string description;
        mapping(address => uint) votes;
        bool executed;
        address target;
        bytes callData;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address voter, uint voteAmount);

    constructor(address _token) {
        token = IERC20(_token);
        _transferOwnership(msg.sender);
    }

    function createProposal(address _target, bytes memory _callData, string memory _description) public {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            executed: false,
            target: _target,
            callData: _callData
        });
        emit ProposalCreated(proposalCount, _description);
    }

    function vote(uint256 _proposalId, uint256 _voteAmount) public {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.votes[msg.sender] == 0, "Already voted on this proposal.");

        uint256 cost = _voteAmount * _voteAmount;
        // In a real system you would lock/transfer these tokens
        require(token.balanceOf(msg.sender) >= cost, "Insufficient tokens for quadratic voting cost.");

        uint voiceCredits = Math.sqrt(cost);
        proposal.votes[msg.sender] = voiceCredits;

        emit Voted(_proposalId, msg.sender, _voteAmount);
    }
}
