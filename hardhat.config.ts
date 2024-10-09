import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE
      },
      mining: {
        auto: true,
        interval: 10000
      },
      chainId: 1337
    }
  }
};

export default config;
