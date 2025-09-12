// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MythicCards is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Card rarity types
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }

    // Card struct
    struct Card {
        string name;
        Rarity rarity;
        uint256 power;
        uint256 defense;
        uint256 minted;
        uint256 maxSupply;
    }

    // Mapping from card name to Card struct
    mapping(string => Card) public cards;
    
    // Mapping from token ID to card name
    mapping(uint256 => string) public tokenIdToCard;

    // Events
    event CardCreated(string name, Rarity rarity, uint256 power, uint256 defense, uint256 maxSupply);
    event CardMinted(address indexed to, uint256 indexed tokenId, string cardName);

    constructor() ERC721("Mythic Warriors Cards", "MWC") {}

    function createCard(
        string memory name,
        Rarity rarity,
        uint256 power,
        uint256 defense,
        uint256 maxSupply
    ) external onlyOwner {
        require(cards[name].maxSupply == 0, "Card already exists");
        cards[name] = Card(name, rarity, power, defense, 0, maxSupply);
        emit CardCreated(name, rarity, power, defense, maxSupply);
    }

    function mintCard(address to, string memory cardName, string memory tokenURI) 
        external 
        onlyOwner 
        nonReentrant 
        returns (uint256) 
    {
        Card storage card = cards[cardName];
        require(card.maxSupply > 0, "Card does not exist");
        require(card.minted < card.maxSupply, "Card supply exhausted");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenIdToCard[newTokenId] = cardName;
        card.minted++;

        emit CardMinted(to, newTokenId, cardName);
        return newTokenId;
    }

    function getCard(uint256 tokenId) external view returns (Card memory) {
        string memory cardName = tokenIdToCard[tokenId];
        return cards[cardName];
    }

    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
