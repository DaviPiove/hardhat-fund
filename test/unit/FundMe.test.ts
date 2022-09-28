import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;
          let mockV3Aggregator: MockV3Aggregator;

          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer); //the fundMe contract is connected to the deployer account (owner), the deployer is calling the transactions
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("getters", () => {
              it("get owner address", async () => {
                  const owner = await fundMe.getOwner();
                  assert.equal(owner, await fundMe.getOwner());
              });
          });

          describe("fund", () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });

              it("update the getAddressToAmountFunded data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("update the getFunders data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer.address);
              });
          });

          describe("withdraw", () => {
              //add some funds to the contract to test it
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single founder", async () => {
                  //Arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      //(ethers.provider.getBalance()) gets the balance of any contract
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  //Assert
                  assert.equal(endingFundMeBalance.toString(), "0");
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows to withdraw with multiple getFunders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      //index 0 is the owner
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  assert.equal(endingFundMeBalance.toString(), "0");
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //make sure that getFunders are reset properly
                  expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          "0"
                      );
                  }
              });

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
