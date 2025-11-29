const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("DeAIToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(token.address);
  await governance.deployed();
  console.log("Governance deployed to:", governance.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
