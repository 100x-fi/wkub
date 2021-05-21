import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-deploy";

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: [
        {
          privateKey: process.env.LOCAL_PRIVATE_KEY_1,
          balance: '10000000000000000000000',
        }, {
          privateKey: process.env.LOCAL_PRIVATE_KEY_2,
          balance: '10000000000000000000000',
        },
      ],
    },
    testnet: {
      url: 'https://rpc-testnet.bitkubchain.io',
      accounts: [process.env.BKC_TESTNET_PRIVATE_KEY],
    },
    mainnet: {
      url: 'https://rpc.bitkubchain.io',
      accounts: [process.env.BKC_MAINNET_PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 888,
      },
      evmVersion: "istanbul",
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './typechain',
    target: process.env.TYPECHAIN_TARGET || 'ethers-v5',
  },
};