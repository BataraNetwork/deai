// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Billing is Ownable {
    IERC20 public paymentToken;
    uint256 public pricePerUnit;
    mapping(address => uint256) public debt;

    event UsageRecorded(address organization, uint256 amount, uint256 cost);
    event CreditApplied(address indexed organization, uint256 amount);

    constructor(address _tokenAddress, uint256 _price) {
        paymentToken = IERC20(_tokenAddress);
        pricePerUnit = _price;
        _transferOwnership(msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        pricePerUnit = _price;
    }

    function recordUsage(address _organization, uint256 _amount) public onlyOwner {
        uint256 cost = _amount * pricePerUnit;
        debt[_organization] += cost;
        emit UsageRecorded(_organization, _amount, cost);
    }

    function applyCredit(address _organization, uint256 _amount) public onlyOwner {
        uint256 currentDebt = debt[_organization];
        require(_amount <= currentDebt, "Billing: Credit amount exceeds current debt");
        debt[_organization] = currentDebt - _amount;
        emit CreditApplied(_organization, _amount);
    }

    function payBill(uint256 _amount) public {
        require(debt[msg.sender] > 0, "Billing: No outstanding debt");
        require(_amount <= debt[msg.sender], "Billing: Payment exceeds debt");
        
        debt[msg.sender] -= _amount;
        require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Billing: Payment failed");
    }

    function withdraw() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "Billing: No funds to withdraw");
        require(paymentToken.transfer(owner(), balance), "Billing: Withdrawal failed");
    }
}
