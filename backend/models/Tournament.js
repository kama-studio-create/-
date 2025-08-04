const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: String,
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  status: { type: String, enum: ['waiting', 'in_progress', 'completed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tournament', TournamentSchema);
