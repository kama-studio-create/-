const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Match constants
const MATCH_CONSTANTS = {
  MAX_ROUNDS: 5,
  TIMEOUT_DURATION: 10 * 60 * 1000 // 10 minutes in milliseconds
};

const MatchSchema = new Schema({
  player1: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  player2: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  winner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  round: {
    type: Number,
    required: true,
    min: 1,
    max: MATCH_CONSTANTS.MAX_ROUNDS
  },
  tournament: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tournament',
    index: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  startedAt: { 
    type: Date,
    default: null
  },
  completedAt: { 
    type: Date,
    default: null
  },
  moves: [{
    player: { type: Schema.Types.ObjectId, ref: 'User' },
    card: { type: Schema.Types.ObjectId, ref: 'Card' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes
MatchSchema.index({ player1: 1, player2: 1 });
MatchSchema.index({ startedAt: -1 });

// Virtual properties
MatchSchema.virtual('duration').get(function() {
  if (!this.startedAt) return 0;
  const end = this.completedAt || Date.now();
  return end - this.startedAt;
});

// Methods
MatchSchema.methods.start = async function() {
  if (this.status !== 'pending') {
    throw new Error('Match cannot be started');
  }
  this.status = 'in_progress';
  this.startedAt = Date.now();
  return this.save();
};

MatchSchema.methods.complete = async function(winnerId) {
  if (this.status !== 'in_progress') {
    throw new Error('Match is not in progress');
  }
  this.status = 'completed';
  this.winner = winnerId;
  this.completedAt = Date.now();
  return this.save();
};

MatchSchema.methods.addMove = async function(playerId, cardId) {
  if (this.status !== 'in_progress') {
    throw new Error('Cannot make move - match is not in progress');
  }
  this.moves.push({
    player: playerId,
    card: cardId,
    timestamp: Date.now()
  });
  return this.save();
};

// Statics
MatchSchema.statics.getPlayerMatches = function(playerId) {
  return this.find({
    $or: [{ player1: playerId }, { player2: playerId }]
  })
  .sort({ startedAt: -1 })
  .populate('player1 player2 winner');
};

module.exports = mongoose.model('Match', MatchSchema);
