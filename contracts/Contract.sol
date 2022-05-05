// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Not much functionality atm, most important is having Openzeppelin/Azuki's ERC721A/dotenv/hardhat libraries from the get-go.
// You can play around with this contract, test that it's working.

contract Contract is Ownable{
    uint number;

    constructor() {
        number = 0;
    }

    function set(uint _number) public {
        number = _number;
    }

    function get() public view returns (uint) {
        return number;
    }

    function deposit() public payable {}

    function withdraw() public onlyOwner {
        uint amount = address(this).balance;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed to withdraw funds.");
    }    
}

