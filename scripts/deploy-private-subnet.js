const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // This script assumes the APIKeyManager contract is already deployed.
  // You would replace this with the actual deployed APIKeyManager address.
  const apiKeyManagerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Example address

  const PrivateSubnet = await ethers.getContractFactory("PrivateSubnet");
  const privateSubnet = await PrivateSubnet.deploy(apiKeyManagerAddress);
  await privateSubnet.deployed();
  console.log("PrivateSubnet deployed to:", privateSubnet.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
