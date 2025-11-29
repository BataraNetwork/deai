const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // This script assumes a token address and a price per unit are available.
  // You would replace these with the actual deployed token address and desired price.
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address
  const pricePerUnit = ethers.utils.parseUnits("1", "gwei"); // Example price

  const Billing = await ethers.getContractFactory("Billing");
  const billing = await Billing.deploy(tokenAddress, pricePerUnit);
  await billing.deployed();
  console.log("Billing deployed to:", billing.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
