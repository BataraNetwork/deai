const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // This script assumes the Billing contract is already deployed.
  // You would replace this with the actual deployed Billing contract address.
  const billingContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Example address

  const SLA = await ethers.getContractFactory("SLA");
  const sla = await SLA.deploy(billingContractAddress);
  await sla.deployed();
  console.log("SLA deployed to:", sla.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
