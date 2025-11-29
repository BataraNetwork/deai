const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // This script assumes a token address is available. 
  // You would replace this with the actual deployed token address.
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(tokenAddress);
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
