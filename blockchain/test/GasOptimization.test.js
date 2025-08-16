const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupTestEnvironment } = require("./helpers");

describe("Gas Optimization Tests", function () {
  let mythicToken;
  let mythicCards;
  let marketplace;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    const setup = await setupTestEnvironment();
    mythicToken = setup.mythicToken;
    mythicCards = setup.mythicCards;
    marketplace = setup.marketplace;
    owner = setup.owner;
    player1 = setup.player1;
    player2 = setup.player2;
  });

  describe("MythicCards Gas Usage", function () {
    it("Should optimize card creation gas usage", async function () {
      const tx = await mythicCards.createCard(
        "Dragon",
        0, // COMMON
        100, // power
        50,  // defense
        1000 // maxSupply
      );
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(200000); // Set reasonable gas limit
    });

    it("Should optimize card minting gas usage", async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
      const tx = await mythicCards.mintCard(
        player1.address,
        "Dragon",
        "ipfs://QmCard1"
      );
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(150000); // Set reasonable gas limit
    });

    it("Should optimize batch minting gas usage", async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
      const addresses = Array(5).fill(player1.address);
      const names = Array(5).fill("Dragon");
      const uris = Array(5).fill("ipfs://QmCard1");
      
      const tx = await mythicCards.batchMint(addresses, names, uris);
      const receipt = await tx.wait();
      const gasPerMint = receipt.gasUsed.div(5);
      expect(gasPerMint).to.be.below(120000); // Should be more efficient than individual mints
    });
  });

  describe("Marketplace Gas Usage", function () {
    beforeEach(async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
      await mythicCards.mintCard(player1.address, "Dragon", "ipfs://QmCard1");
      await mythicCards.connect(player1).approve(marketplace.address, 1);
    });

    it("Should optimize listing creation gas usage", async function () {
      const tx = await marketplace.connect(player1).listCard(
        1,
        ethers.utils.parseEther("100")
      );
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(150000);
    });

    it("Should optimize purchase gas usage", async function () {
      await marketplace.connect(player1).listCard(1, ethers.utils.parseEther("100"));
      await mythicToken.transfer(player2.address, ethers.utils.parseEther("1000"));
      await mythicToken.connect(player2).approve(marketplace.address, ethers.utils.parseEther("1000"));
      
      const tx = await marketplace.connect(player2).buyCard(1);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(200000);
    });
  });

  describe("Token Operations Gas Usage", function () {
    it("Should optimize token transfer gas usage", async function () {
      const tx = await mythicToken.transfer(
        player1.address,
        ethers.utils.parseEther("100")
      );
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(60000);
    });

    it("Should optimize approval gas usage", async function () {
      const tx = await mythicToken.approve(
        marketplace.address,
        ethers.utils.parseEther("1000")
      );
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(50000);
    });
  });
});
