const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BattleHistorySchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'draw'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scoreChange: {
    type: Number,
    required: true
  },
  gameDetails: {
    playerDeck: [{
      type: Schema.Types.ObjectId,
      ref: 'Card'
    }],
    opponentDeck: [{
      type: Schema.Types.ObjectId,
      ref: 'Card'
    }],
    turns: Number,
    duration: Number // in seconds
  }
});

// Add indexes for better query performance
BattleHistorySchema.index({ player: 1, timestamp: -1 });
BattleHistorySchema.index({ opponent: 1, timestamp: -1 });

// Add methods
BattleHistorySchema.methods.getGameSummary = function() {
  return `${this.player.username} vs ${this.opponent.username} - ${this.result}`;
};

// Add statics
BattleHistorySchema.statics.getPlayerStats = async function(playerId) {
  return this.aggregate([
    { $match: { player: playerId } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ["$result", "lose"] }, 1, 0] } },
        draws: { $sum: { $cond: [{ $eq: ["$result", "draw"] }, 1, 0] } }
      }
    }
  ]);
};

// Example usage:
const BattleHistory = require('./models/BattleHistory');

// Create new battle record
const battle = new BattleHistory({
  player: playerId,
  opponent: opponentId,
  result: 'win',
  scoreChange: 25,
  gameDetails: {
    playerDeck: [...cardIds],
    opponentDeck: [...cardIds],
    turns: 10,
    duration: 300
  }
});

// Get player stats
const stats = await BattleHistory.getPlayerStats(playerId);

module.exports = mongoose.model('BattleHistory', BattleHistorySchema);
