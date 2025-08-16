// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MythicToken is ERC20, Ownable {
    // Token parameters
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    uint256 public constant PLAY_REWARD = 10 * 10**18; // 10 tokens per game
    uint256 public constant TOURNAMENT_REWARD = 100 * 10**18; // 100 tokens for tournament win
    
    // Game reward settings
    mapping(address => uint256) public lastPlayReward;
    uint256 public constant REWARD_COOLDOWN = 1 days;

    constructor() ERC20("Mythic Warriors Token", "MYTHIC") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function rewardForPlay(address player) external onlyOwner {
        require(block.timestamp >= lastPlayReward[player] + REWARD_COOLDOWN, "Reward cooldown not met");
        _mint(player, PLAY_REWARD);
        lastPlayReward[player] = block.timestamp;
    }

    function rewardTournamentWinner(address winner) external onlyOwner {
        _mint(winner, TOURNAMENT_REWARD);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
