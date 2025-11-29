const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const APIKeyManager = await ethers.getContractFactory("APIKeyManager");
  const apiKeyManager = await APIKeyManager.deploy();
  await apiKeyManager.deployed();
  console.log("APIKeyManager deployed to:", apiKeyManager.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
