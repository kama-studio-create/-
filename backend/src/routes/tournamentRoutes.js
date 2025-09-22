const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');
const generateBracket = require('../utils/generateBracket');

// Constants
const TOURNAMENT_CONSTANTS = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 32,
  ENTRY_FEE: 100
};

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Join Tournament
router.post('/join', async (req, res) => {
  try {
    const { userId, tournamentId } = req.body;

    // Validate inputs
    if (!userId || !tournamentId) {
      return handleError(res, 400, 'Missing required fields');
    }

    const [user, tournament] = await Promise.all([
      User.findById(userId),
      Tournament.findById(tournamentId).populate('players')
    ]);

    if (!tournament) {
      return handleError(res, 404, 'Tournament not found');
    }

    if (tournament.status !== 'registering') {
      return handleError(res, 400, 'Tournament registration is closed');
    }

    if (tournament.players.length >= TOURNAMENT_CONSTANTS.MAX_PLAYERS) {
      return handleError(res, 400, 'Tournament is full');
    }

    if (tournament.players.some(p => p._id.toString() === userId)) {
      return handleError(res, 400, 'Already registered for this tournament');
    }

    // Check entry fee
    if (user.gold < TOURNAMENT_CONSTANTS.ENTRY_FEE) {
      return handleError(res, 400, 'Insufficient gold for entry fee');
    }

    // Process registration
    user.gold -= TOURNAMENT_CONSTANTS.ENTRY_FEE;
    tournament.players.push(userId);
    tournament.prizePool += TOURNAMENT_CONSTANTS.ENTRY_FEE;

    if (tournament.players.length >= TOURNAMENT_CONSTANTS.MIN_PLAYERS) {
      tournament.status = 'waiting';
    }

    await Promise.all([
      user.save(),
      tournament.save()
    ]);

    res.json({
      success: true,
      message: 'Successfully registered for tournament',
      data: {
        tournamentId: tournament._id,
        playerCount: tournament.players.length,
        status: tournament.status
      }
    });

  } catch (error) {
    console.error('[Tournament Join Error]:', error);
    return handleError(res, 500, 'Failed to join tournament');
  }
});

// List tournaments with filtering and pagination
router.get('/list', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    const [tournaments, total] = await Promise.all([
      Tournament.find(filter)
        .populate('players', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Tournament.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: tournaments,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Tournament List Error]:', error);
    return handleError(res, 500, 'Failed to fetch tournaments');
  }
});

// Start Tournament (admin only)
router.post('/start/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('players');

    if (!tournament) {
      return handleError(res, 404, 'Tournament not found');
    }

    if (tournament.status !== 'waiting') {
      return handleError(res, 400, 'Tournament cannot be started');
    }

    if (tournament.players.length < TOURNAMENT_CONSTANTS.MIN_PLAYERS) {
      return handleError(res, 400, 'Not enough players to start tournament');
    }

    // Generate tournament bracket
    const bracket = await generateBracket(tournament);
    tournament.status = 'in_progress';
    tournament.startTime = new Date();
    await tournament.save();

    res.json({
      success: true,
      message: 'Tournament started successfully',
      data: {
        tournamentId: tournament._id,
        playerCount: tournament.players.length,
        bracket
      }
    });
  } catch (error) {
    console.error('[Tournament Start Error]:', error);
    return handleError(res, 500, 'Failed to start tournament');
  }
});

module.exports = router;
