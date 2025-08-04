const express = require('express');
const router = express.Router();
const MarketListing = require('../models/MarketListing');
const Card = require('../models/Card');
const User = require('../models/User');

// List a card for sale
router.post('/list', async (req, res) => {
  const { userId, cardId, price } = req.body;

  const card = await Card.findOne({ _id: cardId, owner: userId });
  if (!card) return res.status(404).json({ message: 'Card not found or not owned' });

  const existing = await MarketListing.findOne({ cardId });
  if (existing) return res.status(400).json({ message: 'Card already listed' });

  const listing = await MarketListing.create({
    seller: userId,
    cardId,
    price
  });

  res.json({ message: 'Card listed', listing });
});

// Get all listings
router.get('/listings', async (req, res) => {
  const listings = await MarketListing.find()
    .populate('cardId')
    .populate('seller', 'username');

  res.json(listings);
});

// Buy a card
router.post('/buy', async (req, res) => {
  const { userId, listingId } = req.body;

  const listing = await MarketListing.findById(listingId).populate('cardId');
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  const buyer = await User.findById(userId);
  const seller = await User.findById(listing.seller);

  if (buyer.tokens < listing.price) {
    return res.status(400).json({ message: 'Not enough tokens' });
  }

  // Transfer token
  buyer.tokens -= listing.price;
  seller.tokens += listing.price;
  await buyer.save();
  await seller.save();

  // Transfer card ownership
  const card = await Card.findById(listing.cardId._id);
  card.owner = userId;
  await card.save();

  // Remove listing
  await MarketListing.findByIdAndDelete(listingId);

  res.json({ message: 'Purchase successful', newOwner: userId });
});

module.exports = router;
