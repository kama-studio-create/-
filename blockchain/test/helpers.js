const { ethers } = require("hardhat");

async function advanceTime(seconds) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

async function getLatestBlock() {
  return await ethers.provider.getBlock("latest");
}

async function setupTestEnvironment() {
  const [owner, player1, player2, player3] = await ethers.getSigners();
  
  // Deploy MythicToken
  const MythicToken = await ethers.getContractFactory("MythicToken");
  const mythicToken = await MythicToken.deploy();
  
  // Deploy MythicCards
  const MythicCards = await ethers.getContractFactory("MythicCards");
  const mythicCards = await MythicCards.deploy();
  
  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("MarketPlace");
  const marketplace = await Marketplace.deploy(mythicToken.address, mythicCards.address);
  
  // Deploy Presale
  const Presale = await ethers.getContractFactory("Presale");
  const presale = await Presale.deploy(mythicToken.address);

  return {
    owner,
    player1,
    player2,
    player3,
    mythicToken,
    mythicCards,
    marketplace,
    presale
  };
}

module.exports = {
  advanceTime,
  getLatestBlock,
  setupTestEnvironment
};
