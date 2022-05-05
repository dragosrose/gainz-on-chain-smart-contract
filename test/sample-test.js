const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Contract", function(){

  let provider, contract;
  let owner, addr1, addr2;

  beforeEach(async() => {
    [owner, addr1, addr2] = await ethers.getSigners();

    provider = ethers.provider;
    const Contract = await ethers.getContractFactory("Contract");
    contract = await Contract.deploy();
    await contract.deployed();

  });

  it("sets numbers correctly.", async() => {
    await contract.connect(addr1).set(5);
    expect(await contract.get()).to.equal(5);
  });

  it("can donate.", async() =>{
    await contract.connect(addr2).deposit({value: parseEther('1')});
    await contract.connect(addr1).deposit({value: parseEther('1')});

    expect(await provider.getBalance(contract.address)).to.equal(parseEther('2'));
  });

  it("can withdraw.", async() => {
    await contract.connect(owner).withdraw();
    expect(await provider.getBalance(contract.address)).to.equal(0);
  });

})
