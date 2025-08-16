const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MythicToken
  const MythicToken = await ethers.getContractFactory("MythicToken");
  const mythicToken = await MythicToken.deploy();
  await mythicToken.deployed();
  console.log("MythicToken deployed to:", mythicToken.address);

  // Deploy MythicCards
  const MythicCards = await ethers.getContractFactory("MythicCards");
  const mythicCards = await MythicCards.deploy();
  await mythicCards.deployed();
  console.log("MythicCards deployed to:", mythicCards.address);

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("MarketPlace");
  const marketplace = await Marketplace.deploy(mythicToken.address, mythicCards.address);
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // Deploy Presale
  const Presale = await ethers.getContractFactory("Presale");
  const presale = await Presale.deploy(mythicToken.address);
  await presale.deployed();
  console.log("Presale deployed to:", presale.address);

  // Setup roles and permissions
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  await mythicToken.grantRole(MINTER_ROLE, marketplace.address);
  await mythicCards.setApprovalForAll(marketplace.address, true);
  
  console.log("\nDeployment complete! Contract addresses:");
  console.log("===============================");
  console.log("MythicToken:", mythicToken.address);
  console.log("MythicCards:", mythicCards.address);
  console.log("Marketplace:", marketplace.address);
  console.log("Presale:", presale.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
