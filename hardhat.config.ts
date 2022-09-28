import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY ?? "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt", //to output in a file
        noColors: true, //they can be messed up
        currency: "USD" //to get this we need a CoinMarketCap API Key
        //coinmarketcap: COINMARKETCAP_API_KEY
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    }
};

export default config;
