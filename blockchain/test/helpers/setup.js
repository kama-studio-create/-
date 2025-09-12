const enhancedTestHelpers = `
const { ethers } = require("hardhat");
const { expect } = require("chai");

// Constants for testing
const CONSTANTS = {
    INITIAL_SUPPLY: ethers.utils.parseEther("100000000"), // 100M
    PLAY_REWARD: ethers.utils.parseEther("10"),
    WIN_REWARD: ethers.utils.parseEther("25"),
    TOURNAMENT_REWARD: ethers.utils.parseEther("100"),
    DAILY_REWARD: ethers.utils.parseEther("5"),
    MARKETPLACE_FEE: 250, // 2.5%
    REWARD_COOLDOWN: 30 * 60, // 30 minutes
    DAILY_COOLDOWN: 24 * 60 * 60, // 24 hours
    MAX_DAILY_PLAYS: 10
};

// Test data
const CARD_TEMPLATES = [
    {
        name: "Fire Dragon",
        rarity: 4, // LEGENDARY
        attack: 8,
        defense: 6,
        manaCost: 8,
        maxSupply: 100,
        tradeable: true,
        cardType: "Warrior"
    },
    {
        name: "Lightning Bolt",
        rarity: 1, // UNCOMMON
        attack: 0,
        defense: 0,
        manaCost: 3,
        maxSupply: 1000,
        tradeable: true,
        cardType: "Spell"
    },
    {
        name: "Shield Bearer",
        rarity: 0, // COMMON
        attack: 2,
        defense: 5,
        manaCost: 3,
        maxSupply: 5000,
        tradeable: true,
        cardType: "Warrior"
    }
];

// Utility functions
async function advanceTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
}

async function advanceBlocks(blocks) {
    for (let i = 0; i < blocks; i++) {
        await network.provider.send("evm_mine");
    }
}

async function getLatestBlock() {
    return await ethers.provider.getBlock("latest");
}

async function getLatestTimestamp() {
    const block = await getLatestBlock();
    return block.timestamp;
}

async function expectRevert(promise, expectedError) {
    try {
        await promise;
        expect.fail("Expected transaction to revert");
    } catch (error) {
        if (expectedError) {
            expect(error.message).to.include(expectedError);
        }
    }
}

async function expectEvent(tx, eventName, expectedArgs = {}) {
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === eventName);
    expect(event).to.not.be.undefined;
    
    if (Object.keys(expectedArgs).length > 0) {
        for (const [key, value] of Object.entries(expectedArgs)) {
            expect(event.args[key]).to.equal(value);
        }
    }
    
    return event;
}

// Main setup function
async function setupTestEnvironment() {
    // Get signers
    const [deployer, admin, player1, player2, player3, feeRecipient] = await ethers.getSigners();
    
    // Deploy MythicToken
    const MythicToken = await ethers.getContractFactory("MythicToken");
    const mythicToken = await MythicToken.deploy();
    await mythicToken.deployed();
    
    // Deploy MythicCards
    const MythicCards = await ethers.getContractFactory("MythicCards");
    const mythicCards = await MythicCards.deploy();
    await mythicCards.deployed();
    
    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
        mythicToken.address,
        mythicCards.address,
        feeRecipient.address
    );
    await marketplace.deployed();
    
    // Deploy Presale
    const Presale = await ethers.getContractFactory("Presale");
    const presale = await Presale.deploy(mythicToken.address);
    await presale.deployed();

    // Setup roles
    const MINTER_ROLE = await mythicToken.MINTER_ROLE();
    const GAME_ROLE = await mythicCards.GAME_ROLE();
    
    await mythicToken.grantRole(MINTER_ROLE, admin.address);
    await mythicCards.grantRole(GAME_ROLE, admin.address);
    
    // Grant marketplace permissions
    await mythicToken.grantRole(MINTER_ROLE, marketplace.address);
    
    // Create initial card templates
    for (const template of CARD_TEMPLATES) {
        await mythicCards.createCardTemplate(
            template.name,
            template.rarity,
            template.attack,
            template.defense,
            template.manaCost,
            template.maxSupply,
            template.tradeable,
            template.cardType
        );
    }
    
    // Mint some tokens to players for testing
    const amount = ethers.utils.parseEther("10000");
    await mythicToken.transfer(player1.address, amount);
    await mythicToken.transfer(player2.address, amount);
    await mythicToken.transfer(player3.address, amount);

    return {
        // Signers
        deployer,
        admin,
        player1,
        player2,
        player3,
        feeRecipient,
        
        // Contracts
        mythicToken,
        mythicCards,
        marketplace,
        presale,
        
        // Constants
        CONSTANTS,
        CARD_TEMPLATES
    };
}

// Marketplace helpers
async function createTestListing(marketplace, mythicCards, seller, tokenId, price) {
    await mythicCards.connect(seller).approve(marketplace.address, tokenId);
    const duration = 24 * 60 * 60; // 24 hours
    return await marketplace.connect(seller).listCardForSale(tokenId, price, duration);
}

async function createTestAuction(marketplace, mythicCards, seller, tokenId, startingPrice, reservePrice) {
    await mythicCards.connect(seller).approve(marketplace.address, tokenId);
    const duration = 24 * 60 * 60; // 24 hours
    return await marketplace.connect(seller).listCardForAuction(
        tokenId, 
        startingPrice, 
        reservePrice, 
        duration
    );
}

// Game simulation helpers
async function simulateGame(mythicToken, admin, player, won = true) {
    return await mythicToken.connect(admin).rewardForPlay(player.address, won);
}

async function simulateDailyReward(mythicToken, admin, player) {
    return await mythicToken.connect(admin).rewardDaily(player.address);
}

async function simulateTournamentWin(mythicToken, admin, player) {
    return await mythicToken.connect(admin).rewardTournamentWinner(player.address);
}

// Card helpers
async function mintTestCard(mythicCards, recipient, cardName, tokenURI = "ipfs://test") {
    return await mythicCards.mintCard(recipient.address, cardName, tokenURI);
}

async function mintMultipleCards(mythicCards, recipients, cardNames, tokenURIs) {
    const addresses = recipients.map(r => r.address);
    return await mythicCards.batchMintCards(addresses, cardNames, tokenURIs);
}

// Balance helpers
async function getBalances(token, addresses) {
    const balances = {};
    for (const addr of addresses) {
        balances[addr] = await token.balanceOf(addr);
    }
    return balances;
}

async function expectBalanceChange(token, address, expectedChange, transaction) {
    const balanceBefore = await token.balanceOf(address);
    await transaction;
    const balanceAfter = await token.balanceOf(address);
    const actualChange = balanceAfter.sub(balanceBefore);
    expect(actualChange).to.equal(expectedChange);
}

// Gas tracking helpers
async function trackGasUsage(transaction, description) {
    const receipt = await transaction.wait();
    console.log(\`Gas used for \${description}: \${receipt.gasUsed.toString()}\`);
    return receipt.gasUsed;
}

module.exports = {
    // Main setup
    setupTestEnvironment,
    
    // Constants and data
    CONSTANTS,
    CARD_TEMPLATES,
    
    // Utility functions
    advanceTime,
    advanceBlocks,
    getLatestBlock,
    getLatestTimestamp,
    expectRevert,
    expectEvent,
    
    // Marketplace helpers
    createTestListing,
    createTestAuction,
    
    // Game helpers
    simulateGame,
    simulateDailyReward,
    simulateTournamentWin,
    
    // Card helpers
    mintTestCard,
    mintMultipleCards,
    
    // Balance helpers
    getBalances,
    expectBalanceChange,
    
    // Gas tracking
    trackGasUsage
};`;
