// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SimpleVault.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title SimpleVaultMultiToken
/// @notice Extends SimpleVault with multi-token support
contract SimpleVaultMultiToken is SimpleVault {
    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(address => uint256)) public tokenBalances; // user => token => balance
    mapping(address => uint256) public tokenRecommendedWithdrawLimit; // token => limit per user
    
    address[] public tokenList;
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event TokenAgentRecommendation(address indexed agent, address indexed user, address indexed token, uint256 newLimit, string reason);
    
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!supportedTokens[token], "Token already supported");
        
        supportedTokens[token] = true;
        tokenList.push(token);
        
        emit TokenAdded(token);
    }
    
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        
        supportedTokens[token] = false;
        
        // Remove from tokenList
        for (uint i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        
        emit TokenRemoved(token);
    }
    
    function depositToken(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Zero amount");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
        
        emit TokenDeposited(msg.sender, token, amount);
    }
    
    function withdrawToken(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Zero amount");
        
        uint256 bal = tokenBalances[msg.sender][token];
        require(bal >= amount, "Insufficient balance");
        
        tokenBalances[msg.sender][token] = bal - amount;
        IERC20(token).transfer(msg.sender, amount);
        
        emit TokenWithdrawn(msg.sender, token, amount);
    }
    
    function agentSetTokenWithdrawLimit(
        address user,
        address token,
        uint256 newLimit,
        string calldata reason
    ) external onlyAgent {
        require(supportedTokens[token], "Token not supported");
        
        tokenRecommendedWithdrawLimit[token] = newLimit;
        emit TokenAgentRecommendation(msg.sender, user, token, newLimit, reason);
    }
    
    function getUserTokenBalance(address user, address token) external view returns (uint256) {
        return tokenBalances[user][token];
    }
    
    function getUserAllBalances(address user) external view returns (address[] memory tokens, uint256[] memory amounts) {
        uint256 length = tokenList.length + 1; // +1 for native token
        tokens = new address[](length);
        amounts = new uint256[](length);
        
        // Native token (CRO)
        tokens[0] = address(0);
        amounts[0] = balances[user];
        
        // ERC20 tokens
        for (uint i = 0; i < tokenList.length; i++) {
            tokens[i + 1] = tokenList[i];
            amounts[i + 1] = tokenBalances[user][tokenList[i]];
        }
    }
    
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    function getTokenRecommendedLimit(address token) external view returns (uint256) {
        return tokenRecommendedWithdrawLimit[token];
    }
}