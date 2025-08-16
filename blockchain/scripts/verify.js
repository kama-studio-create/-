const { ethers } = require("hardhat");

async function verify() {
  const [deployer] = await ethers.getSigners();
  console.log("Verifying contracts with the account:", deployer.address);

  // Get contract addresses from environment or deployment
  const MYTHIC_TOKEN_ADDRESS = process.env.MYTHIC_TOKEN_ADDRESS;
  const MYTHIC_CARDS_ADDRESS = process.env.MYTHIC_CARDS_ADDRESS;
  const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS;
  const PRESALE_ADDRESS = process.env.PRESALE_ADDRESS;

  // Verify MythicToken
  await hre.run("verify:verify", {
    address: MYTHIC_TOKEN_ADDRESS,
    constructorArguments: [],
  });

  // Verify MythicCards
  await hre.run("verify:verify", {
    address: MYTHIC_CARDS_ADDRESS,
    constructorArguments: [],
  });

  // Verify Marketplace
  await hre.run("verify:verify", {
    address: MARKETPLACE_ADDRESS,
    constructorArguments: [MYTHIC_TOKEN_ADDRESS, MYTHIC_CARDS_ADDRESS],
  });

  // Verify Presale
  await hre.run("verify:verify", {
    address: PRESALE_ADDRESS,
    constructorArguments: [MYTHIC_TOKEN_ADDRESS],
  });
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
