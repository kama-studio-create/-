// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MarketPlace is Ownable, ReentrancyGuard {
    IERC20 public mythicToken;
    address public mythicCards;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    // Mapping from tokenId to Listing
    mapping(uint256 => Listing) public listings;
    
    // Events
    event CardListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CardSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor(address _mythicToken, address _mythicCards) {
        mythicToken = IERC20(_mythicToken);
        mythicCards = _mythicCards;
    }

    function listCard(uint256 tokenId, uint256 price) external nonReentrant {
        require(IERC721(mythicCards).ownerOf(tokenId) == msg.sender, "Not card owner");
        require(IERC721(mythicCards).getApproved(tokenId) == address(this), "Card not approved");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Card already listed");

        listings[tokenId] = Listing(msg.sender, tokenId, price, true);
        emit CardListed(tokenId, msg.sender, price);
    }

    function buyCard(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Card not listed");
        require(mythicToken.balanceOf(msg.sender) >= listing.price, "Insufficient balance");

        // Transfer token and payment
        mythicToken.transferFrom(msg.sender, listing.seller, listing.price);
        IERC721(mythicCards).transferFrom(listing.seller, msg.sender, tokenId);

        emit CardSold(tokenId, listing.seller, msg.sender, listing.price);
        listing.active = false;
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Card not listed");
        require(listing.seller == msg.sender, "Not seller");

        listing.active = false;
        emit ListingCancelled(tokenId, msg.sender);
    }

    function updateListingPrice(uint256 tokenId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Card not listed");
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice > 0, "Price must be greater than 0");

        listing.price = newPrice;
        emit CardListed(tokenId, msg.sender, newPrice);
    }
}
