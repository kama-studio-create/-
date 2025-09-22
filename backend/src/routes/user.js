const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Card = require('../models/Card');
const ReferenceLeagueEntry = require('../models/ReferenceLeagueEntry');

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!id) {
      return handleError(res, 400, 'User ID is required');
    }

    // Get user data
    const [user, cardCount, referral] = await Promise.all([
      User.findById(id)
        .select('username gold pvpTickets vipMonths deck')
        .populate('deck', 'name type rarity')
        .lean(),
      Card.countDocuments({ owner: id }),
      ReferenceLeagueEntry.findOne({ user: id })
        .select('referralPoints')
        .lean()
    ]);

    if (!user) {
      return handleError(res, 404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        gold: user.gold,
        pvpTickets: user.pvpTickets,
        vipMonths: user.vipMonths || 0,
        cardCount,
        deck: user.deck || [],
        referralPoints: referral?.referralPoints || 0,
        isVIP: user.vipMonths > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Profile Error]:', error);
    return handleError(res, 500, 'Failed to fetch profile');
  }
});

// Update user profile
router.patch('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return handleError(res, 400, 'Username is required');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        username,
        lastActive: new Date()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-__v');

    if (!user) {
      return handleError(res, 404, 'User not found');
    }

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Profile Update Error]:', error);
    return handleError(res, 500, 'Failed to update profile');
  }
});

// Get user stats
router.get('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return handleError(res, 404, 'User not found');
    }

    const stats = {
      totalCards: await Card.countDocuments({ owner: id }),
      deckSize: user.deck?.length || 0,
      vipStatus: user.vipMonths > 0,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Stats Error]:', error);
    return handleError(res, 500, 'Failed to fetch user stats');
  }
});

module.exports = router;
