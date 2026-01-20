// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SimpleVault.sol";

/// @title SimpleVaultYield
/// @notice Extends SimpleVault with yield generation strategies
contract SimpleVaultYield is SimpleVault {
    uint256 public yieldRate = 500; // 5% APY (500/10000)
    uint256 public lastYieldUpdate;
    uint256 public totalYieldGenerated;
    
    mapping(address => uint256) public lastUserYieldClaim;
    mapping(address => uint256) public userYieldEarned;
    
    event YieldGenerated(address indexed user, uint256 amount);
    event YieldClaimed(address indexed user, uint256 amount);
    event YieldRateUpdated(uint256 newRate);
    
    constructor() {
        lastYieldUpdate = block.timestamp;
    }
    
    function deposit() external payable override {
        require(msg.value > 0, "No value sent");
        
        // Update yield before deposit
        updateUserYield(msg.sender);
        
        balances[msg.sender] += msg.value;
        lastUserYieldClaim[msg.sender] = block.timestamp;
        
        emit Deposited(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external override {
        // Update yield before withdrawal
        updateUserYield(msg.sender);
        
        uint256 bal = balances[msg.sender];
        require(amount > 0, "Zero amount");
        require(bal >= amount, "Insufficient balance");
        
        balances[msg.sender] = bal - amount;
        
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Withdraw failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function updateUserYield(address user) internal {
        if (balances[user] == 0) return;
        
        uint256 timeElapsed = block.timestamp - lastUserYieldClaim[user];
        if (timeElapsed == 0) return;
        
        // Calculate yield: balance * rate * time / (365 days * 10000)
        uint256 yield = (balances[user] * yieldRate * timeElapsed) / (365 days * 10000);
        
        if (yield > 0) {
            userYieldEarned[user] += yield;
            totalYieldGenerated += yield;
            lastUserYieldClaim[user] = block.timestamp;
            
            emit YieldGenerated(user, yield);
        }
    }
    
    function claimYield() external {
        updateUserYield(msg.sender);
        
        uint256 yield = userYieldEarned[msg.sender];
        require(yield > 0, "No yield to claim");
        
        userYieldEarned[msg.sender] = 0;
        balances[msg.sender] += yield;
        
        emit YieldClaimed(msg.sender, yield);
    }
    
    function compoundYield() external {
        updateUserYield(msg.sender);
        
        uint256 yield = userYieldEarned[msg.sender];
        if (yield > 0) {
            userYieldEarned[msg.sender] = 0;
            balances[msg.sender] += yield;
            lastUserYieldClaim[msg.sender] = block.timestamp;
            
            emit YieldClaimed(msg.sender, yield);
        }
    }
    
    function setYieldRate(uint256 _rate) external onlyOwner {
        require(_rate <= 2000, "Rate too high"); // Max 20% APY
        yieldRate = _rate;
        emit YieldRateUpdated(_rate);
    }
    
    function getPendingYield(address user) external view returns (uint256) {
        if (balances[user] == 0) return userYieldEarned[user];
        
        uint256 timeElapsed = block.timestamp - lastUserYieldClaim[user];
        uint256 newYield = (balances[user] * yieldRate * timeElapsed) / (365 days * 10000);
        
        return userYieldEarned[user] + newYield;
    }
    
    function getTotalBalance(address user) external view returns (uint256) {
        return balances[user] + this.getPendingYield(user);
    }
}