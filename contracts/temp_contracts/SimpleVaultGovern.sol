// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SimpleVault.sol";

/// @title SimpleVaultGovern
/// @notice Extends SimpleVault with governance features
contract SimpleVaultGovern is SimpleVault {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        ProposalType proposalType;
        bytes proposalData;
    }
    
    enum ProposalType {
        CHANGE_AGENT,
        CHANGE_OWNER,
        EMERGENCY_PAUSE,
        PARAMETER_CHANGE
    }
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public minProposalThreshold = 1000 ether; // Min balance to propose
    uint256 public quorumThreshold = 5000 ether; // Min votes needed
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public votingPower; // Based on balance
    
    bool public paused;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event VaultPaused(bool paused);
    
    modifier notPaused() {
        require(!paused, "Vault is paused");
        _;
    }
    
    modifier onlyGovernance() {
        require(msg.sender == owner || msg.sender == agent, "Not authorized");
        _;
    }
    
    function deposit() external payable override notPaused {
        require(msg.value > 0, "No value sent");
        
        balances[msg.sender] += msg.value;
        votingPower[msg.sender] = balances[msg.sender]; // Update voting power
        
        emit Deposited(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external override notPaused {
        uint256 bal = balances[msg.sender];
        require(amount > 0, "Zero amount");
        require(bal >= amount, "Insufficient balance");
        
        balances[msg.sender] = bal - amount;
        votingPower[msg.sender] = balances[msg.sender]; // Update voting power
        
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Withdraw failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function createProposal(
        string calldata description,
        ProposalType proposalType,
        bytes calldata proposalData
    ) external returns (uint256) {
        require(balances[msg.sender] >= minProposalThreshold, "Insufficient balance to propose");
        
        uint256 proposalId = proposalCount++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executed: false,
            proposalType: proposalType,
            proposalData: proposalData
        });
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.startTime > 0, "Proposal does not exist");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        uint256 weight = votingPower[msg.sender];
        
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.startTime > 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        require(proposal.votesFor >= quorumThreshold, "Quorum not reached");
        
        proposal.executed = true;
        
        if (proposal.proposalType == ProposalType.CHANGE_AGENT) {
            address newAgent = abi.decode(proposal.proposalData, (address));
            emit AgentUpdated(agent, newAgent);
            agent = newAgent;
        } else if (proposal.proposalType == ProposalType.CHANGE_OWNER) {
            address newOwner = abi.decode(proposal.proposalData, (address));
            owner = newOwner;
        } else if (proposal.proposalType == ProposalType.EMERGENCY_PAUSE) {
            bool shouldPause = abi.decode(proposal.proposalData, (bool));
            paused = shouldPause;
            emit VaultPaused(shouldPause);
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    function emergencyPause() external onlyGovernance {
        paused = true;
        emit VaultPaused(true);
    }
    
    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit VaultPaused(false);
    }
    
    function setVotingPeriod(uint256 _period) external onlyOwner {
        require(_period >= 1 days && _period <= 30 days, "Invalid period");
        votingPeriod = _period;
    }
    
    function setThresholds(uint256 _proposalThreshold, uint256 _quorumThreshold) external onlyOwner {
        minProposalThreshold = _proposalThreshold;
        quorumThreshold = _quorumThreshold;
    }
    
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function getVotingPower(address user) external view returns (uint256) {
        return votingPower[user];
    }
}