const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupTestEnvironment } = require("./helpers");

describe("Marketplace", function () {
  let marketplace;
  let mythicToken;
  let mythicCards;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    const setup = await setupTestEnvironment();
    marketplace = setup.marketplace;
    mythicToken = setup.mythicToken;
    mythicCards = setup.mythicCards;
    owner = setup.owner;
    player1 = setup.player1;
    player2 = setup.player2;

    // Create and mint a card for testing
    await mythicCards.createCard("Dragon", 0, 100, 50, 1000);
    await mythicCards.mintCard(player1.address, "Dragon", "ipfs://QmCard1");
    await mythicCards.connect(player1).approve(marketplace.address, 1);

    // Give some tokens to player2 for buying
    await mythicToken.transfer(player2.address, ethers.utils.parseEther("1000"));
    await mythicToken.connect(player2).approve(marketplace.address, ethers.utils.parseEther("1000"));
  });

  describe("Listing Cards", function () {
    it("Should list a card for sale", async function () {
      await marketplace.connect(player1).listCard(1, ethers.utils.parseEther("100"));
      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(player1.address);
      expect(listing.price).to.equal(ethers.utils.parseEther("100"));
      expect(listing.active).to.be.true;
    });

    it("Should not list if not card owner", async function () {
      await expect(
        marketplace.connect(player2).listCard(1, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Not card owner");
    });
  });

  describe("Buying Cards", function () {
    beforeEach(async function () {
      await marketplace.connect(player1).listCard(1, ethers.utils.parseEther("100"));
    });

    it("Should complete a sale", async function () {
      await marketplace.connect(player2).buyCard(1);
      expect(await mythicCards.ownerOf(1)).to.equal(player2.address);
      expect(await mythicToken.balanceOf(player1.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should fail if buyer has insufficient balance", async function () {
      // Transfer all tokens away from player2
      await mythicToken.connect(player2).transfer(owner.address, await mythicToken.balanceOf(player2.address));
      
      await expect(
        marketplace.connect(player2).buyCard(1)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Cancelling Listings", function () {
    beforeEach(async function () {
      await marketplace.connect(player1).listCard(1, ethers.utils.parseEther("100"));
    });

    it("Should cancel a listing", async function () {
      await marketplace.connect(player1).cancelListing(1);
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("Should not allow non-seller to cancel", async function () {
      await expect(
        marketplace.connect(player2).cancelListing(1)
      ).to.be.revertedWith("Not seller");
    });
  });

  describe("Updating Listings", function () {
    beforeEach(async function () {
      await marketplace.connect(player1).listCard(1, ethers.utils.parseEther("100"));
    });

    it("Should update listing price", async function () {
      await marketplace.connect(player1).updateListingPrice(1, ethers.utils.parseEther("150"));
      const listing = await marketplace.listings(1);
      expect(listing.price).to.equal(ethers.utils.parseEther("150"));
    });

    it("Should not allow non-seller to update price", async function () {
      await expect(
        marketplace.connect(player2).updateListingPrice(1, ethers.utils.parseEther("150"))
      ).to.be.revertedWith("Not seller");
    });
  });
});
