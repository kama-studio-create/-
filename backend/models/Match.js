const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  round: Number,
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  startedAt: Date,
  completedAt: Date,
});

module.exports = mongoose.model('Match', MatchSchema);
