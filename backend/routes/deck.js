const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save deck to user's profile
router.post('/save', async (req, res) => {
  const { telegramId, deck } = req.body;

  if (!telegramId || !deck || deck.length > 30) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deck = deck;
    await user.save();

    res.status(200).json({ message: 'Deck saved successfully' });
  } catch (err) {
    console.error('[Deck Save Error]', err);
    res.status(500).json({ error: 'Failed to save deck' });
  }
});

module.exports = router;
