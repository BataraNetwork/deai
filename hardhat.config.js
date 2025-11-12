require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // This is a sample network configuration. 
    // You can add more networks like polygon, arbitrum, or base.
    // You will need to add the private keys and RPC URLs for those networks.
    hardhat: {},
    // polygon: {
    //   url: "YOUR_POLYGON_RPC_URL",
    //   accounts: ["YOUR_PRIVATE_KEY"]
    // }
  }
};
