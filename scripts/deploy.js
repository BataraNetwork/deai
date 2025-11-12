const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DeAIToken
  const DeAIToken = await hre.ethers.getContractFactory("DeAIToken");
  const daiToken = await DeAIToken.deploy();
  await daiToken.waitForDeployment();
  console.log("DeAIToken deployed to:", await daiToken.getAddress());

  // Deploy Staking contract
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await daiToken.getAddress());
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());

  // Deploy RewardDistribution contract
  const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
  const rewardDistribution = await RewardDistribution.deploy(await daiToken.getAddress());
  await rewardDistribution.waitForDeployment();
  console.log("RewardDistribution deployed to:", await rewardDistribution.getAddress());

  // Deploy ModelMarketplace contract
  const ModelMarketplace = await hre.ethers.getContractFactory("ModelMarketplace");
  const modelMarketplace = await ModelMarketplace.deploy();
  await modelMarketplace.waitForDeployment();
  console.log("ModelMarketplace deployed to:", await modelMarketplace.getAddress());
  
  // Transfer ownership of DeAIToken to RewardDistribution contract
  console.log("Transferring ownership of DeAIToken to RewardDistribution...");
  const tx = await daiToken.transferOwnership(await rewardDistribution.getAddress());
  await tx.wait();
  console.log("Ownership transferred.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
