const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Clan = require('../models/Clan');

// Constants
const MIN_DONATION = 10;
const MAX_MESSAGE_LENGTH = 1000;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Donate to clan
router.post('/donate', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Validate amount
    if (!amount || amount < MIN_DONATION) {
      return handleError(res, 400, `Minimum donation is ${MIN_DONATION} gold`);
    }

    // Find user and validate clan membership
    const user = await User.findById(userId);
    if (!user || !user.clanId) {
      return handleError(res, 400, 'User not found or not in a clan');
    }

    // Check user's gold balance
    if (user.gold < amount) {
      return handleError(res, 400, 'Insufficient gold balance');
    }

    // Process donation
    const clan = await Clan.findById(user.clanId);
    clan.treasury += amount;
    user.gold -= amount;

    // Save changes atomically
    await Promise.all([
      clan.save(),
      user.save()
    ]);

    res.json({
      success: true,
      message: `Successfully donated ${amount} gold`,
      data: {
        newBalance: user.gold,
        clanTreasury: clan.treasury
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Donation error:', error);
    return handleError(res, 500, 'Error processing donation');
  }
});

// Post a message to the clan board
router.post('/message', async (req, res) => {
  try {
    const { userId, text } = req.body;

    // Validate message
    if (!text || text.length > MAX_MESSAGE_LENGTH) {
      return handleError(res, 400, `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);
    }

    // Find user and validate clan membership
    const user = await User.findById(userId);
    if (!user || !user.clanId) {
      return handleError(res, 400, 'User not found or not in a clan');
    }

    // Add message to clan
    const clan = await Clan.findById(user.clanId);
    clan.messages.push({ 
      user: userId, 
      text,
      createdAt: new Date()
    });
    await clan.save();

    res.json({
      success: true,
      message: 'Message posted successfully',
      data: {
        messageId: clan.messages[clan.messages.length - 1]._id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Message posting error:', error);
    return handleError(res, 500, 'Error posting message');
  }
});

module.exports = router;
