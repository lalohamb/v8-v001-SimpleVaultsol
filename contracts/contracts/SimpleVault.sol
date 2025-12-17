// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SimpleVault
/// @notice Minimal contract to test Cronos + AI agent integration
/// @dev V1 adds an "agent hook" for advisory withdrawal limits.
///

contract SimpleVault {
    // --- Core Vault State ---
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // --- Governance & Agent State ---
    address public owner;
    address public agent; // AI agent address (EOA or smart account)

    // AI advisory state: recommended maximum withdrawal per user (soft limit)
    mapping(address => uint256) public recommendedWithdrawLimit;

    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event AgentRecommendation(
        address indexed agent,
        address indexed user,
        uint256 newLimit,
        string reason
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Not agent");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Core Vault Functions ---

    function deposit() external payable {
        require(msg.value > 0, "No value sent");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        uint256 bal = balances[msg.sender];
        require(amount > 0, "Zero amount");
        require(bal >= amount, "Insufficient balance");

        // NOTE: For v1, we DO NOT enforce recommendedWithdrawLimit on-chain.
        // Frontends / off-chain services can read it and enforce policies.
        balances[msg.sender] = bal - amount;

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }

    // --- Governance Functions ---

    /// @notice Owner sets the AI agent address.
    function setAgent(address _agent) external onlyOwner {
        emit AgentUpdated(agent, _agent);
        agent = _agent;
    }

    // --- Agent Hook: Advisory Withdraw Limit ---

    /// @notice Called by the AI agent to publish a recommended withdrawal limit for a user.
    /// @dev This does not enforce any restriction by itself; it is advisory metadata.
    /// @param user The user for whom the limit is recommended.
    /// @param newLimit The recommended maximum withdrawal amount (wei).
    /// @param reason A short, human-readable rationale.
    function agentSetWithdrawLimit(
        address user,
        uint256 newLimit,
        string calldata reason
    ) external onlyAgent {
        recommendedWithdrawLimit[user] = newLimit;
        emit AgentRecommendation(msg.sender, user, newLimit, reason);
    }
}
