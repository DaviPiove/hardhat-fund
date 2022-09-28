import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing Contract...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Done!");
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
