const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');

// Constants
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Get top players
router.get('/top', async (req, res) => {
  try {
    const { limit = DEFAULT_LIMIT, page = 1 } = req.query;
    const pageSize = Math.min(parseInt(limit), MAX_LIMIT);
    const skip = (parseInt(page) - 1) * pageSize;

    const [topPlayers, total] = await Promise.all([
      Leaderboard.find()
        .sort({ rating: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('userId', 'username')
        .select('-__v'),
      Leaderboard.countDocuments()
    ]);

    res.json({
      success: true,
      data: topPlayers,
      pagination: {
        page: parseInt(page),
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Leaderboard Error]:', error);
    return handleError(res, 500, 'Error fetching leaderboard');
  }
});

// Get player rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const player = await Leaderboard.findOne({ userId });

    if (!player) {
      return handleError(res, 404, 'Player not found');
    }

    const rank = await Leaderboard.countDocuments({
      rating: { $gt: player.rating }
    });

    res.json({
      success: true,
      data: {
        rank: rank + 1,
        rating: player.rating,
        wins: player.wins,
        losses: player.losses
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Rank Error]:', error);
    return handleError(res, 500, 'Error fetching player rank');
  }
});

module.exports = router;

