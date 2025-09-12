const mythicTokenContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title MythicToken
 * @dev Enhanced ERC20 token for Mythic Warriors game
 */
contract MythicToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Token economics
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens max
    
    // Game rewards
    uint256 public constant PLAY_REWARD = 10 * 10**18; // 10 tokens per game
    uint256 public constant WIN_REWARD = 25 * 10**18; // 25 tokens for winning
    uint256 public constant TOURNAMENT_REWARD = 100 * 10**18; // 100 tokens for tournament win
    uint256 public constant DAILY_REWARD = 5 * 10**18; // 5 tokens daily login
    
    // Anti-farming measures
    mapping(address => uint256) public lastPlayReward;
    mapping(address => uint256) public lastDailyReward;
    mapping(address => uint256) public dailyPlayCount;
    mapping(address => uint256) public lastDayPlayed;
    
    uint256 public constant REWARD_COOLDOWN = 30 minutes;
    uint256 public constant DAILY_COOLDOWN = 1 days;
    uint256 public constant MAX_DAILY_PLAYS = 10;

    // Events
    event PlayReward(address indexed player, uint256 amount, bool won);
    event DailyReward(address indexed player, uint256 amount);
    event TournamentReward(address indexed player, uint256 amount);

    constructor() ERC20("Mythic Warriors Token", "MYTHIC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Reward player for playing a game
     */
    function rewardForPlay(address player, bool won) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(player != address(0), "Invalid player address");
        require(
            block.timestamp >= lastPlayReward[player].add(REWARD_COOLDOWN),
            "Reward cooldown not met"
        );
        
        // Reset daily count if new day
        if (block.timestamp >= lastDayPlayed[player].add(DAILY_COOLDOWN)) {
            dailyPlayCount[player] = 0;
            lastDayPlayed[player] = block.timestamp;
        }
        
        require(dailyPlayCount[player] < MAX_DAILY_PLAYS, "Daily play limit reached");
        
        uint256 reward = won ? WIN_REWARD : PLAY_REWARD;
        require(totalSupply().add(reward) <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(player, reward);
        lastPlayReward[player] = block.timestamp;
        dailyPlayCount[player] = dailyPlayCount[player].add(1);
        
        emit PlayReward(player, reward, won);
    }

    /**
     * @dev Reward player for daily login
     */
    function rewardDaily(address player) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(player != address(0), "Invalid player address");
        require(
            block.timestamp >= lastDailyReward[player].add(DAILY_COOLDOWN),
            "Daily reward already claimed"
        );
        require(totalSupply().add(DAILY_REWARD) <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(player, DAILY_REWARD);
        lastDailyReward[player] = block.timestamp;
        
        emit DailyReward(player, DAILY_REWARD);
    }

    /**
     * @dev Reward tournament winner
     */
    function rewardTournamentWinner(address winner) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(winner != address(0), "Invalid winner address");
        require(totalSupply().add(TOURNAMENT_REWARD) <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(winner, TOURNAMENT_REWARD);
        emit TournamentReward(winner, TOURNAMENT_REWARD);
    }

    /**
     * @dev Burn tokens from account
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from account with burner role
     */
    function burnFrom(address account, uint256 amount) 
        external 
        onlyRole(BURNER_ROLE) 
    {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _approve(account, msg.sender, currentAllowance.sub(amount));
        _burn(account, amount);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer to include pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Get player's reward status
     */
    function getPlayerRewardStatus(address player) 
        external 
        view 
        returns (
            uint256 nextPlayReward,
            uint256 nextDailyReward,
            uint256 playsToday,
            uint256 playsRemaining
        ) 
    {
        nextPlayReward = lastPlayReward[player].add(REWARD_COOLDOWN);
        nextDailyReward = lastDailyReward[player].add(DAILY_COOLDOWN);
        
        if (block.timestamp >= lastDayPlayed[player].add(DAILY_COOLDOWN)) {
            playsToday = 0;
        } else {
            playsToday = dailyPlayCount[player];
        }
        
        playsRemaining = MAX_DAILY_PLAYS > playsToday ? MAX_DAILY_PLAYS.sub(playsToday) : 0;
    }
}`;
