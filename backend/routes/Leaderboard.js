const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');

router.get('/top', async (req, res) => {
  const topPlayers = await Leaderboard.find().sort({ wins: -1 }).limit(10);
  res.json(topPlayers);
});

module.exports = router;

