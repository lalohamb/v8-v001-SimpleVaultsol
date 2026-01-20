// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SimpleVault.sol";

/// @title SimpleVaultFee
/// @notice Extends SimpleVault with configurable fee mechanisms
contract SimpleVaultFee is SimpleVault {
    uint256 public depositFeeRate = 50; // 0.5% (50/10000)
    uint256 public withdrawFeeRate = 100; // 1% (100/10000)
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max
    
    address public feeRecipient;
    uint256 public totalFeesCollected;
    
    event FeeCollected(address indexed user, uint256 amount, string feeType);
    event FeeRatesUpdated(uint256 depositFee, uint256 withdrawFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    
    constructor() {
        feeRecipient = owner;
    }
    
    function deposit() external payable override {
        require(msg.value > 0, "No value sent");
        
        uint256 fee = (msg.value * depositFeeRate) / 10000;
        uint256 netAmount = msg.value - fee;
        
        balances[msg.sender] += netAmount;
        totalFeesCollected += fee;
        
        emit Deposited(msg.sender, netAmount);
        if (fee > 0) {
            emit FeeCollected(msg.sender, fee, "deposit");
        }
    }
    
    function withdraw(uint256 amount) external override {
        uint256 bal = balances[msg.sender];
        require(amount > 0, "Zero amount");
        require(bal >= amount, "Insufficient balance");
        
        uint256 fee = (amount * withdrawFeeRate) / 10000;
        uint256 netAmount = amount - fee;
        
        balances[msg.sender] = bal - amount;
        totalFeesCollected += fee;
        
        (bool ok, ) = msg.sender.call{value: netAmount}("");
        require(ok, "Withdraw failed");
        
        emit Withdrawn(msg.sender, netAmount);
        if (fee > 0) {
            emit FeeCollected(msg.sender, fee, "withdraw");
        }
    }
    
    function setFeeRates(uint256 _depositFee, uint256 _withdrawFee) external onlyOwner {
        require(_depositFee <= MAX_FEE_RATE, "Deposit fee too high");
        require(_withdrawFee <= MAX_FEE_RATE, "Withdraw fee too high");
        
        depositFeeRate = _depositFee;
        withdrawFeeRate = _withdrawFee;
        
        emit FeeRatesUpdated(_depositFee, _withdrawFee);
    }
    
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        emit FeeRecipientUpdated(feeRecipient, _recipient);
        feeRecipient = _recipient;
    }
    
    function collectFees() external onlyOwner {
        uint256 fees = totalFeesCollected;
        require(fees > 0, "No fees to collect");
        
        totalFeesCollected = 0;
        
        (bool ok, ) = feeRecipient.call{value: fees}("");
        require(ok, "Fee collection failed");
    }
}