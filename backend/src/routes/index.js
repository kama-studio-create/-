const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const deckRoutes = require('./decks');
const battleRoutes = require('./battles');
const marketplaceRoutes = require('./marketplace');
const clanRoutes = require('./clans');
const tournamentRoutes = require('./tournaments');
const leaderboardRoutes = require('./leaderboard');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('/decks', deckRoutes);
router.use('/battles', battleRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/clans', clanRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;