import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import { ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain-types";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Test", () => {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;
          const sendValue = ethers.utils.parseEther("0.1");

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              fundMe = await ethers.getContract("FundMe", deployer.address);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw({
                  gasLimit: 100000
              });
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
