const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// Constants
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Get all cards with filtering and pagination
router.get('/all', async (req, res) => {
  try {
    const { 
      type, 
      rarity, 
      page = 1, 
      limit = DEFAULT_PAGE_SIZE 
    } = req.query;

    // Validate pagination params
    const pageSize = Math.min(Number(limit), MAX_PAGE_SIZE);
    const skip = (Number(page) - 1) * pageSize;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (rarity) filter.rarity = rarity;

    // Execute query with pagination
    const [cards, total] = await Promise.all([
      Card.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize)
        .select('-__v'),
      Card.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: cards,
      pagination: {
        total,
        page: Number(page),
        pageSize,
        pages: Math.ceil(total / pageSize)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return handleError(res, 500, 'Error fetching cards');
  }
});

// Get card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).select('-__v');
    
    if (!card) {
      return handleError(res, 404, 'Card not found');
    }

    res.json({
      success: true,
      data: card,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return handleError(res, 500, 'Error fetching card');
  }
});

// Search cards
router.get('/search/:query', async (req, res) => {
  try {
    const cards = await Card.find({
      name: { $regex: req.params.query, $options: 'i' }
    })
    .limit(20)
    .select('-__v');

    res.json({
      success: true,
      data: cards,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching cards:', error);
    return handleError(res, 500, 'Error searching cards');
  }
});

module.exports = router;
