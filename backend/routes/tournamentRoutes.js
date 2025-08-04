const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');

// Join Tournament
router.post('/join', async (req, res) => {
  try {
    const { userId, tournamentId } = req.body;
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    if (tournament.players.includes(userId))
      return res.status(400).json({ message: 'Already registered' });

    tournament.players.push(userId);
    await tournament.save();

    res.json({ message: 'Registered successfully', tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// List active tournaments
router.get('/list', async (req, res) => {
  try {
    const tournaments = await Tournament.find({ status: { $ne: 'completed' } }).populate('players');
    res.json(tournaments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

const generateBracket = require('../utils/generateBracket');

// Start Tournament (admin only or manually triggered)
router.post('/start/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || tournament.status !== 'waiting') {
      return res.status(400).json({ message: 'Invalid tournament' });
    }

    await generateBracket(tournament);
    res.json({ message: 'Tournament started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Start failed' });
  }
});
