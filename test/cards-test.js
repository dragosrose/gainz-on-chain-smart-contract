const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe.only("Cards", function(){

  let provider, contract;
  let owner, addr1, addr2, addr3, addr4, addr5, addr6;

  let merkleTree, leafNodes;

  let whitelist;
  
  beforeEach(async() => {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    
    whitelist = [addr1, addr3, addr5];
    leafNodes = whitelist.map(addr => keccak256(addr.address));
    merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    // console.log(merkleTree.getHexRoot());
    provider = ethers.provider;
    const Contract = await ethers.getContractFactory("Cards");
    contract = await Contract.deploy("hiddenURI.xyz/");
    await contract.deployed();

  });

  it("displays root for me", async() => {

  });

  it("mints for whitelisted users successfully", async() => {
    const hex1 = merkleTree.getHexProof(leafNodes[0]);
    await contract.connect(addr1).mint(3, hex1, {value: parseEther('0.03')});
  });

  // it("doesn't mint for users that are not whitelisted and think they are smart.", async() => {
  //   const hex = merkleTree.getHexProof(keccak256(addr1.address));
  //   await contract.connect(addr2).mint(3, hex, {value: parseEther('0.01')})
  // });

  it("works as intended.", async() => {
    const hex = leafNodes.map(leaf => merkleTree.getHexProof(leaf));

    await contract.connect(owner).setPauseState(true);
    await contract.connect(owner).setOnlyWhitelisted(false);
    await contract.connect(owner).setPauseState(false);


    await contract.connect(addr1).mint(3, merkleTree.getHexProof(keccak256(addr1.address)), {value: parseEther('0.01')});
    await contract.connect(addr3).mint(3, hex[1], {value: parseEther('0.006')});
    await contract.connect(addr5).mint(3, hex[2], {value: parseEther('0.006')});
    console.log(await contract.connect(addr2).tokenURI(2));

    
    // doesn't matter the hex
    await contract.connect(addr2).mint(3, hex[0], {value: parseEther('0.006')});
    await contract.connect(addr4).mint(3, hex[0], {value: parseEther('0.006')});
    await contract.connect(addr6).mint(3, hex[0], {value: parseEther('0.006')});

    await contract.connect(owner).setRevealState('tokenBaseURI.xyz/');
    console.log(await contract.connect(addr2).tokenURI(2));
  });


//   it("can donate.", async() =>{
//     await contract.connect(addr2).deposit({value: parseEther('1')});
//     await contract.connect(addr1).deposit({value: parseEther('1')});

//     expect(await provider.getBalance(contract.address)).to.equal(parseEther('2'));
//   });

//   it("can withdraw.", async() => {
//     await contract.connect(owner).withdraw();
//     expect(await provider.getBalance(contract.address)).to.equal(0);
//   });

})