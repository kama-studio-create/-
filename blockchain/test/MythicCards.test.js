const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupTestEnvironment } = require("./helpers");

describe("MythicCards", function () {
  let mythicCards;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    const setup = await setupTestEnvironment();
    mythicCards = setup.mythicCards;
    owner = setup.owner;
    player1 = setup.player1;
    player2 = setup.player2;
  });

  describe("Card Creation", function () {
    it("Should create a new card type", async function () {
      await mythicCards.createCard(
        "Dragon",
        0, // COMMON
        100, // power
        50,  // defense
        1000 // maxSupply
      );

      const card = await mythicCards.cards("Dragon");
      expect(card.name).to.equal("Dragon");
      expect(card.power).to.equal(100);
      expect(card.defense).to.equal(50);
      expect(card.maxSupply).to.equal(1000);
    });

    it("Should not allow duplicate card names", async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
      await expect(
        mythicCards.createCard("Dragon", 0, 100, 50, 1000)
      ).to.be.revertedWith("Card already exists");
    });

    it("Only owner can create cards", async function () {
      await expect(
        mythicCards.connect(player1).createCard("Dragon", 0, 100, 50, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Card Minting", function () {
    beforeEach(async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
    });

    it("Should mint a new card", async function () {
      await mythicCards.mintCard(
        player1.address,
        "Dragon",
        "ipfs://QmCard1"
      );

      const tokenId = 1;
      expect(await mythicCards.ownerOf(tokenId)).to.equal(player1.address);
      expect(await mythicCards.tokenURI(tokenId)).to.equal("ipfs://QmCard1");
    });

    it("Should not exceed max supply", async function () {
      await mythicCards.createCard("LimitedCard", 0, 100, 50, 1);
      await mythicCards.mintCard(player1.address, "LimitedCard", "ipfs://QmCard1");
      
      await expect(
        mythicCards.mintCard(player2.address, "LimitedCard", "ipfs://QmCard2")
      ).to.be.revertedWith("Card supply exhausted");
    });
  });

  describe("Card Information", function () {
    it("Should return correct card information", async function () {
      await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
      await mythicCards.mintCard(player1.address, "Dragon", "ipfs://QmCard1");

      const card = await mythicCards.getCard(1);
      expect(card.name).to.equal("Dragon");
      expect(card.power).to.equal(100);
      expect(card.defense).to.equal(50);
    });
  });
});
