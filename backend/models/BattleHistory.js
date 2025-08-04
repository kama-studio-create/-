const mongoose = require('mongoose');

const BattleHistorySchema = new mongoose.Schema({
  player: String,
  opponent: String,
  result: String, // win/lose/draw
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BattleHistory', BattleHistorySchema);
