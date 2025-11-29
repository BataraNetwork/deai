// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Governance is Ownable {
    IERC20 public token;

    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(address => bool) hasVoted;
        bool executed;
        address target;
        bytes callData;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address voter, bool vote);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _token) {
        token = IERC20(_token);
        // The deployer of the contract is the owner
        _transferOwnership(msg.sender);
    }

    function createProposal(address _target, bytes memory _callData, string memory _description) public {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            target: _target,
            callData: _callData
        });
        emit ProposalCreated(proposalCount, _description);
    }

    function vote(uint256 _proposalId, bool _vote) public {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        uint256 votingPower = token.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        if (_vote) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        emit Voted(_proposalId, msg.sender, _vote);
    }

    function executeProposal(uint256 _proposalId) public {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed"); // simple majority

        proposal.executed = true;
        (bool success, ) = proposal.target.call(proposal.callData);
        require(success, "Execution failed");

        emit ProposalExecuted(_proposalId);
    }
}