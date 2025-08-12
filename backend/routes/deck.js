const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Card = require('../models/Card');

// Constants
const MAX_DECK_SIZE = 30;
const MIN_DECK_SIZE = 20;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Save deck to user's profile
router.post('/save', async (req, res) => {
  try {
    const { telegramId, deck } = req.body;

    // Validate input
    if (!telegramId || !Array.isArray(deck)) {
      return handleError(res, 400, 'Invalid request data');
    }

    // Validate deck size
    if (deck.length < MIN_DECK_SIZE || deck.length > MAX_DECK_SIZE) {
      return handleError(res, 400, `Deck must contain between ${MIN_DECK_SIZE} and ${MAX_DECK_SIZE} cards`);
    }

    // Find user
    const user = await User.findOne({ telegramId }).populate('cards');
    if (!user) {
      return handleError(res, 404, 'User not found');
    }

    // Validate card ownership
    const invalidCards = deck.filter(cardId => !user.cards.find(c => c._id.toString() === cardId));
    if (invalidCards.length > 0) {
      return handleError(res, 400, 'Deck contains cards you don\'t own');
    }

    // Save deck
    user.deck = deck;
    await user.save();

    res.json({
      success: true,
      message: 'Deck saved successfully',
      data: {
        deckSize: deck.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Deck Save Error]:', error);
    return handleError(res, 500, 'Failed to save deck');
  }
});

// Get user's current deck
router.get('/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;

    const user = await User.findOne({ telegramId })
      .populate('deck', 'name type rarity attack defense');

    if (!user) {
      return handleError(res, 404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        deck: user.deck,
        deckSize: user.deck.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Deck Fetch Error]:', error);
    return handleError(res, 500, 'Failed to fetch deck');
  }
});

// Validate deck composition
router.post('/validate', async (req, res) => {
  try {
    const { deck } = req.body;

    if (!Array.isArray(deck)) {
      return handleError(res, 400, 'Invalid deck data');
    }

    // Check deck size
    if (deck.length < MIN_DECK_SIZE || deck.length > MAX_DECK_SIZE) {
      return handleError(res, 400, `Deck must contain between ${MIN_DECK_SIZE} and ${MAX_DECK_SIZE} cards`);
    }

    // Validate cards exist
    const cards = await Card.find({ _id: { $in: deck } });
    if (cards.length !== deck.length) {
      return handleError(res, 400, 'Deck contains invalid cards');
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        deckSize: deck.length,
        composition: {
          warriors: cards.filter(c => c.type === 'warrior').length,
          spells: cards.filter(c => c.type === 'spell').length,
          equipment: cards.filter(c => c.type === 'equipment').length
        }
      }
    });
  } catch (error) {
    console.error('[Deck Validation Error]:', error);
    return handleError(res, 500, 'Failed to validate deck');
  }
});

module.exports = router;
