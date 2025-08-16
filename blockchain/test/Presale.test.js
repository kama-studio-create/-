const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupTestEnvironment, advanceTime } = require("./helpers");

describe("Presale", function () {
  let presale;
  let mythicToken;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    const setup = await setupTestEnvironment();
    presale = setup.presale;
    mythicToken = setup.mythicToken;
    owner = setup.owner;
    player1 = setup.player1;
    player2 = setup.player2;

    // Fund presale contract with tokens
    await mythicToken.transfer(presale.address, ethers.utils.parseEther("1000000"));
  });

  describe("Whitelist", function () {
    it("Should add addresses to whitelist", async function () {
      await presale.addToWhitelist([player1.address, player2.address]);
      expect(await presale.isWhitelisted(player1.address)).to.be.true;
      expect(await presale.isWhitelisted(player2.address)).to.be.true;
    });

    it("Should remove addresses from whitelist", async function () {
      await presale.addToWhitelist([player1.address]);
      await presale.removeFromWhitelist([player1.address]);
      expect(await presale.isWhitelisted(player1.address)).to.be.false;
    });
  });

  describe("Presale Periods", function () {
    it("Should set presale periods correctly", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 24 hours after start
      
      await presale.setPresalePeriod(startTime, endTime);
      const period = await presale.presalePeriod();
      expect(period.start).to.equal(startTime);
      expect(period.end).to.equal(endTime);
    });

    it("Should not allow invalid time periods", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime - 86400; // End before start
      
      await expect(
        presale.setPresalePeriod(startTime, endTime)
      ).to.be.revertedWith("Invalid time period");
    });
  });

  describe("Token Purchase", function () {
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      await presale.setPresalePeriod(startTime, endTime);
      await presale.addToWhitelist([player1.address]);
    });

    it("Should allow whitelisted addresses to purchase tokens", async function () {
      const purchaseAmount = ethers.utils.parseEther("100");
      await presale.connect(player1).purchaseTokens({ value: purchaseAmount });
      
      const tokensBought = await mythicToken.balanceOf(player1.address);
      expect(tokensBought).to.be.gt(0);
    });

    it("Should respect purchase limits", async function () {
      const maxPurchase = await presale.maxPurchaseAmount();
      await expect(
        presale.connect(player1).purchaseTokens({ value: maxPurchase.add(1) })
      ).to.be.revertedWith("Exceeds maximum purchase amount");
    });

    it("Should not allow non-whitelisted addresses to purchase", async function () {
      await expect(
        presale.connect(player2).purchaseTokens({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Not whitelisted");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw collected ETH", async function () {
      await presale.addToWhitelist([player1.address]);
      await presale.connect(player1).purchaseTokens({ value: ethers.utils.parseEther("1") });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await presale.withdrawETH();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should allow owner to withdraw unsold tokens", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      await presale.setPresalePeriod(startTime, endTime);
      
      // Advance time past presale end
      await advanceTime(86401);

      const initialBalance = await mythicToken.balanceOf(owner.address);
      await presale.withdrawUnsoldTokens();
      const finalBalance = await mythicToken.balanceOf(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
