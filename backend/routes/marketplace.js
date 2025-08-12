const express = require('express');
const router = express.Router();
const MarketListing = require('../models/MarketListing');
const Card = require('../models/Card');
const User = require('../models/User');
const mongoose = require('mongoose');

// Constants
const MIN_PRICE = 1;
const MAX_PRICE = 1000000;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// List a card for sale
router.post('/list', async (req, res) => {
  try {
    const { userId, cardId, price } = req.body;

    // Validate price
    if (!price || price < MIN_PRICE || price > MAX_PRICE) {
      return handleError(res, 400, `Price must be between ${MIN_PRICE} and ${MAX_PRICE}`);
    }

    const card = await Card.findOne({ _id: cardId, owner: userId });
    if (!card) {
      return handleError(res, 404, 'Card not found or not owned');
    }

    const existing = await MarketListing.findOne({ cardId, status: 'active' });
    if (existing) {
      return handleError(res, 400, 'Card already listed');
    }

    const listing = new MarketListing({
      seller: userId,
      cardId,
      price,
      createdAt: new Date()
    });

    await listing.save();

    res.json({
      success: true,
      message: 'Card listed successfully',
      data: {
        listingId: listing._id,
        price: listing.price,
        timestamp: listing.createdAt
      }
    });
  } catch (error) {
    console.error('[Marketplace List Error]:', error);
    return handleError(res, 500, 'Error creating listing');
  }
});

// Get all listings with filters and pagination
router.get('/listings', async (req, res) => {
  try {
    const { page = 1, limit = 20, minPrice, maxPrice, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { status: 'active' };
    if (minPrice) filter.price = { $gte: parseInt(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseInt(maxPrice) };

    const [listings, total] = await Promise.all([
      MarketListing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('cardId')
        .populate('seller', 'username'),
      MarketListing.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Marketplace List Error]:', error);
    return handleError(res, 500, 'Error fetching listings');
  }
});

// Buy a card
router.post('/buy', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, listingId } = req.body;

    const listing = await MarketListing.findById(listingId)
      .populate('cardId')
      .session(session);

    if (!listing || listing.status !== 'active') {
      await session.abortTransaction();
      return handleError(res, 404, 'Listing not found or inactive');
    }

    const [buyer, seller] = await Promise.all([
      User.findById(userId).session(session),
      User.findById(listing.seller).session(session)
    ]);

    if (buyer.tokens < listing.price) {
      await session.abortTransaction();
      return handleError(res, 400, 'Insufficient tokens');
    }

    // Process transaction
    buyer.tokens -= listing.price;
    seller.tokens += listing.price;
    listing.status = 'sold';
    listing.buyer = userId;
    listing.soldAt = new Date();

    const card = await Card.findById(listing.cardId._id).session(session);
    card.owner = userId;

    // Save all changes
    await Promise.all([
      buyer.save({ session }),
      seller.save({ session }),
      listing.save({ session }),
      card.save({ session })
    ]);

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Purchase successful',
      data: {
        cardId: card._id,
        price: listing.price,
        timestamp: listing.soldAt
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[Marketplace Buy Error]:', error);
    return handleError(res, 500, 'Error processing purchase');
  } finally {
    session.endSession();
  }
});

module.exports = router;
