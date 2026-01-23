// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SettlementPayment
/// @notice x402 Payment Required protocol for settlement workflows
/// @dev Users pay in TCRO to unlock settlement execution
contract SettlementPayment {
    // --- State ---
    address public owner;
    address public recipient; // Address that receives settlement payments
    uint256 public settlementFee; // Fee in wei (TCRO)

    // Track paid jobs: jobId => payer address
    mapping(bytes32 => address) public paidJobs;
    
    // Track payment amounts: jobId => amount paid
    mapping(bytes32 => uint256) public paymentAmounts;
    
    // Track executed jobs: jobId => true if consumed (use-once enforcement)
    mapping(bytes32 => bool) public executedJobs;
    
    // Authorized executors (backend service addresses)
    mapping(address => bool) public authorizedExecutors;

    // --- Events ---
    event SettlementPaid(
        bytes32 indexed jobId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event SettlementExecuted(
        bytes32 indexed jobId,
        address indexed executor,
        uint256 timestamp
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event RecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event ExecutorAuthorized(address indexed executor);
    event ExecutorRevoked(address indexed executor);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // --- Constructor ---
    constructor(address _recipient, uint256 _settlementFee) {
        require(_recipient != address(0), "Invalid recipient");
        owner = msg.sender;
        recipient = _recipient;
        settlementFee = _settlementFee;
        authorizedExecutors[msg.sender] = true; // Owner is authorized by default
    }

    // --- Payment Functions ---

    /// @notice Pay for a settlement job in TCRO
    /// @param jobId Unique identifier for the settlement job
    function payForSettlement(string calldata jobId) external payable {
        require(bytes(jobId).length > 0, "Empty job ID");
        require(msg.value >= settlementFee, "Insufficient payment");

        bytes32 jobHash = keccak256(bytes(jobId));
        require(paidJobs[jobHash] == address(0), "Job already paid");

        // Record payment
        paidJobs[jobHash] = msg.sender;
        paymentAmounts[jobHash] = msg.value;

        // Transfer payment to recipient
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Payment transfer failed");

        emit SettlementPaid(jobHash, msg.sender, msg.value, block.timestamp);
    }

    /// @notice Check if a job has been paid for
    /// @param jobId The job identifier to check
    /// @return isPaid Whether the job has been paid
    /// @return payer The address that paid for the job
    /// @return amount The amount paid
    function checkPayment(string calldata jobId) 
        external 
        view 
        returns (bool isPaid, address payer, uint256 amount) 
    {
        bytes32 jobHash = keccak256(bytes(jobId));
        payer = paidJobs[jobHash];
        amount = paymentAmounts[jobHash];
        isPaid = payer != address(0);
    }

    /// @notice Internal function to verify payment (used by backend)
    /// @param jobId The job identifier
    /// @return True if the job has been paid
    function isJobPaid(string calldata jobId) external view returns (bool) {
        bytes32 jobHash = keccak256(bytes(jobId));
        return paidJobs[jobHash] != address(0);
    }
    
    /// @notice Check if a job has been executed (consumed)
    /// @param jobId The job identifier
    /// @return True if the job has been executed
    function isJobExecuted(string calldata jobId) external view returns (bool) {
        bytes32 jobHash = keccak256(bytes(jobId));
        return executedJobs[jobHash];
    }
    
    /// @notice Check if a job is available for execution (paid but not executed)
    /// @param jobId The job identifier
    /// @return available True if paid and not yet executed
    function isJobAvailable(string calldata jobId) external view returns (bool available) {
        bytes32 jobHash = keccak256(bytes(jobId));
        available = paidJobs[jobHash] != address(0) && !executedJobs[jobHash];
    }
    
    /// @notice Mark a job as executed (use-once enforcement)
    /// @param jobId The job identifier
    /// @dev Only authorized executors (backend service) can call this
    function markJobExecuted(string calldata jobId) external {
        require(authorizedExecutors[msg.sender], "Not authorized executor");
        
        bytes32 jobHash = keccak256(bytes(jobId));
        require(paidJobs[jobHash] != address(0), "Job not paid");
        require(!executedJobs[jobHash], "Job already executed");
        
        executedJobs[jobHash] = true;
        emit SettlementExecuted(jobHash, msg.sender, block.timestamp);
    }

    // --- Admin Functions ---

    /// @notice Update the settlement fee
    /// @param newFee New fee amount in wei
    function setSettlementFee(uint256 newFee) external onlyOwner {
        emit FeeUpdated(settlementFee, newFee);
        settlementFee = newFee;
    }

    /// @notice Update the payment recipient address
    /// @param newRecipient New recipient address
    function setRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        emit RecipientUpdated(recipient, newRecipient);
        recipient = newRecipient;
    }

    /// @notice Transfer ownership
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }
    
    /// @notice Authorize an executor (backend service address)
    /// @param executor Address to authorize
    function authorizeExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor");
        authorizedExecutors[executor] = true;
        emit ExecutorAuthorized(executor);
    }
    
    /// @notice Revoke executor authorization
    /// @param executor Address to revoke
    function revokeExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = false;
        emit ExecutorRevoked(executor);
    }

    // --- View Functions ---

    /// @notice Get the current settlement fee
    /// @return The fee in wei (TCRO)
    function getSettlementFee() external view returns (uint256) {
        return settlementFee;
    }

    /// @notice Get the payment recipient address
    /// @return The recipient address
    function getRecipient() external view returns (address) {
        return recipient;
    }
}

