const hre = require("hardhat");

async function main() {
  
  const Contract = await hre.ethers.getContractFactory("Cards");
  const contract = await Contract.deploy("ipfs://QmbXrf7XoipafXZcNmNAjE6wFHTa5ii1Wa5r6dYzzPgygR/");

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
