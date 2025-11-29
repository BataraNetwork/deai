// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBilling {
    function applyCredit(address _organization, uint256 _amount) external;
}

contract SLA is Ownable {
    IBilling public billingContract;

    struct Agreement {
        uint96 uptimeGuarantee; // e.g., 9999 for 99.99%
        uint256 penaltyAmount; // Penalty per hour of downtime
        bool exists;
    }

    mapping(address => Agreement) public agreements;
    mapping(address => uint256) public downtimeHours;

    event AgreementSet(address indexed organization, uint96 uptimeGuarantee, uint256 penaltyAmount);
    event DowntimeRecorded(address indexed organization, uint256 downtime);
    event PenaltyApplied(address indexed organization, uint256 amount);

    constructor(address _billingContractAddress) {
        billingContract = IBilling(_billingContractAddress);
        _transferOwnership(msg.sender);
    }

    function setAgreement(address _organization, uint96 _uptimeGuarantee, uint256 _penaltyAmount) public onlyOwner {
        agreements[_organization] = Agreement({ 
            uptimeGuarantee: _uptimeGuarantee, 
            penaltyAmount: _penaltyAmount, 
            exists: true 
        });
        emit AgreementSet(_organization, _uptimeGuarantee, _penaltyAmount);
    }

    function recordDowntime(address _organization, uint256 _hours) public onlyOwner {
        require(agreements[_organization].exists, "SLA: No agreement for this organization");
        downtimeHours[_organization] += _hours;
        emit DowntimeRecorded(_organization, _hours);
    }

    function applyPenalty(address _organization) public onlyOwner {
        Agreement memory agreement = agreements[_organization];
        require(agreement.exists, "SLA: No agreement for this organization");

        uint256 totalHoursInPeriod = 730; // Assuming a 30-day month
        uint256 uptime = (totalHoursInPeriod - downtimeHours[_organization]) * 10000 / totalHoursInPeriod;

        if (uptime < agreement.uptimeGuarantee) {
            uint256 penalty = downtimeHours[_organization] * agreement.penaltyAmount;
            billingContract.applyCredit(_organization, penalty);
            downtimeHours[_organization] = 0; // Reset downtime after penalty
            emit PenaltyApplied(_organization, penalty);
        }
    }
}
