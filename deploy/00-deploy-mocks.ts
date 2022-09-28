import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

const DECIMALS = "18";
const INITIAL_PRICE = "2000000000000000000000"; // 2000

const deployMock: DeployFunction = async ({
    getNamedAccounts,
    deployments
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        });
        log("Mocks deployed!");
        log("---------------------------------------------");
    }
};

export default deployMock;

deployMock.tags = ["all", "mocks"];
