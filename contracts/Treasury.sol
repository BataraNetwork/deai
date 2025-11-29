// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Treasury is Ownable, ReentrancyGuard {
    IERC20 public token;

    struct Payee {
        address account;
        uint256 share;
    }

    Payee[] public payees;
    mapping(address => bool) public isPayee;
    uint256 public totalShares;

    event PayeeAdded(address account, uint256 share);
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(address token, address to, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        _transferOwnership(msg.sender);
    }

    function addPayee(address _account, uint256 _share) public onlyOwner {
        require(!isPayee[_account], "Treasury: account is already a payee");
        require(_account != address(0), "Treasury: account is the zero address");
        require(_share > 0, "Treasury: shares must be greater than 0");

        payees.push(Payee({account: _account, share: _share}));
        isPayee[_account] = true;
        totalShares = totalShares + _share;
        emit PayeeAdded(_account, _share);
    }
    
    function release() public nonReentrant {
        uint256 balance = address(this).balance;
        require(totalShares > 0, "Treasury: no payees");
        require(balance > 0, "Treasury: no balance to release");

        for (uint i = 0; i < payees.length; i++) {
            Payee storage payee = payees[i];
            uint256 payment = (balance * payee.share) / totalShares;
            if (payment > 0) {
                 (bool success, ) = payable(payee.account).call{value: payment}("");
                 require(success, "Treasury: Failed to send Ether");
                 emit PaymentReleased(payee.account, payment);
            }
        }
    }

    function releaseErc20(address _tokenAddress) public nonReentrant {
        IERC20 erc20 = IERC20(_tokenAddress);
        uint256 balance = erc20.balanceOf(address(this));
        require(totalShares > 0, "Treasury: no payees");
        require(balance > 0, "Treasury: no balance to release");

        for (uint i = 0; i < payees.length; i++) {
            Payee storage payee = payees[i];
            uint256 payment = (balance * payee.share) / totalShares;
             if (payment > 0) {
                erc20.transfer(payee.account, payment);
                emit ERC20PaymentReleased(_tokenAddress, payee.account, payment);
            }
        }
    }
    
    receive() external payable {}
}
