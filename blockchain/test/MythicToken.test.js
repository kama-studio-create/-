const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupTestEnvironment } = require("./helpers");

describe("MythicToken", function () {
  let mythicToken;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    const setup = await setupTestEnvironment();
    mythicToken = setup.mythicToken;
    owner = setup.owner;
    player1 = setup.player1;
    player2 = setup.player2;
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mythicToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await mythicToken.balanceOf(owner.address);
      expect(await mythicToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to player1
      await mythicToken.transfer(player1.address, 50);
      expect(await mythicToken.balanceOf(player1.address)).to.equal(50);

      // Transfer 50 tokens from player1 to player2
      await mythicToken.connect(player1).transfer(player2.address, 50);
      expect(await mythicToken.balanceOf(player2.address)).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await mythicToken.balanceOf(owner.address);
      await expect(
        mythicToken.connect(player1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await mythicToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });

  describe("Game Rewards", function () {
    it("Should reward players for playing", async function () {
      await mythicToken.rewardForPlay(player1.address);
      const reward = await mythicToken.PLAY_REWARD();
      expect(await mythicToken.balanceOf(player1.address)).to.equal(reward);
    });

    it("Should reward tournament winners", async function () {
      await mythicToken.rewardTournamentWinner(player1.address);
      const reward = await mythicToken.TOURNAMENT_REWARD();
      expect(await mythicToken.balanceOf(player1.address)).to.equal(reward);
    });

    it("Should enforce reward cooldown", async function () {
      await mythicToken.rewardForPlay(player1.address);
      await expect(
        mythicToken.rewardForPlay(player1.address)
      ).to.be.revertedWith("Reward cooldown not met");
    });
  });
});
