// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "erc721a/contracts/ERC721A.sol";

contract Cards is ERC721A, Ownable {
    using Strings for uint;

    uint public constant maxPerAddressMint = 20;
    uint public constant whiteListCost = 0.001 ether;
    uint public constant publicCost = 0.002 ether;

    bool public paused = false;
    bool public revealed = false;
    
    bool public onlyWhitelisted = true;
    bytes32 public constant merkleRoot = 0x454ca788f7003e172b179451bcec4ea9d3a7e50cce8f70fbd39240012f400d07;
    
    uint public maxSupply = 208;

    string private baseURI;
    
    // string[] cardURI;
    // mapping (uint => bool) cardRewardClaimed;
    
    constructor(string memory _baseTokenURI) ERC721A ("Cards", "CARD") {
        setBaseURI(_baseTokenURI);        
    }

    function mint(uint quantity, bytes32[] calldata _merkleProof) external callerIsUser payable {
        uint supply = totalSupply();
        uint numberMinted = _numberMinted(msg.sender);

        require(!paused, "The sale has stopped.");
        require(quantity > 0, "Minimum amount to mint is 1.");
        require(quantity + supply <= maxSupply, "Total supply exceeds maximum supply.");
        require(numberMinted + quantity <= maxPerAddressMint, "Maximum number of tokens minted exceeded.");
        
        if(onlyWhitelisted) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid proof.");
            require(msg.value >= whiteListCost * quantity, "Invalid amount of tokens sent.");
        } else {
            require(msg.value >= publicCost * quantity, "Invalid amount of tokens sent. ");
        } 
        
        _safeMint(msg.sender, quantity);
    }

    function setPauseState(bool _state) external onlyOwner {
        paused = _state;
    }

    function setRevealState(string memory _newURI) external onlyOwner {
        revealed = true;
        setBaseURI(_newURI);
    }

    function setOnlyWhitelisted(bool _state) external onlyOwner {
        onlyWhitelisted = _state;
    }

    function getOnlyWhitelisted() external view returns (bool){
        return onlyWhitelisted;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseURI = _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        string memory baseURI_ = _baseURI();

        if(!revealed) {
            return baseURI_;
        }

        return bytes(baseURI_).length != 0 ? string(abi.encodePacked(baseURI_, tokenId.toString(), '.json')) : '';
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function withdraw() external onlyOwner{
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer has failed.");
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "Caller must not be a contract.");
        _;
    }

    

}