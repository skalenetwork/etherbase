import { HardhatUserConfig } from "hardhat/config";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage"

const config: HardhatUserConfig = {
  solidity: "0.8.9",
};

export default config;
