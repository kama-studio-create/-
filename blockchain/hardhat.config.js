require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("hardhat-abi-exporter");
require("solidity-coverage");
require("dotenv").config();

const { 
  PRIVATE_KEY, 
  INFURA_PROJECT_ID, 
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  COINMARKETCAP_API_KEY 
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000,
      forking: process.env.FORKING_URL ? {
        url: process.env.FORKING_URL,
        blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER) || undefined
      } : undefined
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    // Ethereum networks
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: "auto",
      gasMultiplier: 1.2
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5,
      gasPrice: "auto"
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto"
    },
    // BSC networks
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 5000000000, // 5 gwei
      gasMultiplier: 1.2
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 10000000000 // 10 gwei
    },
    // Polygon networks
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto"
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: "auto"
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "reports/gas-report.txt",
    noColors: true,
    showTimeSpent: true,
    showMethodSig: true
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [":Mythic"]
  },
  abiExporter: {
    path: "./abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    format: "json"
  },
  mocha: {
    timeout: 60000,
    reporter: "spec"
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5"
  }
};
