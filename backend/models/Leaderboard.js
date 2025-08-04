const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  userId: String,
  username: String,
  wins: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
