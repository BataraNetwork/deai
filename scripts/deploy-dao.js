const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // This script assumes the GovernanceToken contract is already deployed.
  // You would replace this with the actual deployed GovernanceToken address.
  const governanceTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address

  const DAO = await ethers.getContractFactory("DAO");
  const dao = await DAO.deploy(governanceTokenAddress);
  await dao.deployed();
  console.log("DAO deployed to:", dao.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
