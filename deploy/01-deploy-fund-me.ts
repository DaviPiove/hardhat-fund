import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployFundMe: DeployFunction = async ({
    getNamedAccounts,
    deployments
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator"); //get the most recent deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!;
    }

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //arguments of constructor
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations ?? 1
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify contract
        await verify(fundMe.address, args);
    }
    log("---------------------------------------------------------");
};

export default deployFundMe;

deployFundMe.tags = ["all", "fundme"];
