const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Constants for rating calculations
const RATING_CONSTANTS = {
  INITIAL_RATING: 1000,
  K_FACTOR: 32,
  MIN_RATING: 100,
  MAX_RATING: 3000
};

const LeaderboardSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 30
  },
  wins: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  losses: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  rating: {
    type: Number,
    default: RATING_CONSTANTS.INITIAL_RATING,
    min: RATING_CONSTANTS.MIN_RATING,
    max: RATING_CONSTANTS.MAX_RATING,
    index: true
  },
  streak: {
    type: Number,
    default: 0
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LeaderboardSchema.index({ wins: -1 });
LeaderboardSchema.index({ rating: -1 });

// Virtuals
LeaderboardSchema.virtual('totalGames').get(function() {
  return this.wins + this.losses;
});

LeaderboardSchema.virtual('winStreak').get(function() {
  return this.streak > 0 ? this.streak : 0;
});

LeaderboardSchema.virtual('loseStreak').get(function() {
  return this.streak < 0 ? Math.abs(this.streak) : 0;
});

// Virtual for win rate
LeaderboardSchema.virtual('winRate').get(function() {
  const total = this.wins + this.losses;
  return total > 0 ? (this.wins / total * 100).toFixed(2) : 0;
});

// Methods
LeaderboardSchema.methods.addWin = async function() {
  this.wins += 1;
  this.streak = Math.max(0, this.streak + 1);
  this.lastUpdated = Date.now();
  return this.save();
};

LeaderboardSchema.methods.addLoss = async function() {
  this.losses += 1;
  this.streak = Math.min(0, this.streak - 1);
  this.lastUpdated = Date.now();
  return this.save();
};

LeaderboardSchema.methods.calculateNewRating = function(opponentRating, didWin) {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.rating) / 400));
  const actualScore = didWin ? 1 : 0;
  const newRating = this.rating + RATING_CONSTANTS.K_FACTOR * (actualScore - expectedScore);
  
  return Math.min(Math.max(newRating, RATING_CONSTANTS.MIN_RATING), RATING_CONSTANTS.MAX_RATING);
};

LeaderboardSchema.methods.updateAfterMatch = async function(opponentRating, didWin) {
  this.rating = this.calculateNewRating(opponentRating, didWin);
  if (didWin) {
    await this.addWin();
  } else {
    await this.addLoss();
  }
  return this.save();
};

// Statics
LeaderboardSchema.statics.getTopPlayers = function(limit = 10, criteria = 'rating') {
  const sortCriteria = {};
  sortCriteria[criteria] = -1;
  
  return this.find()
    .sort(sortCriteria)
    .limit(limit)
    .populate('userId', 'username');
};

LeaderboardSchema.statics.getRankForPlayer = async function(userId) {
  const player = await this.findOne({ userId });
  if (!player) return null;
  
  const rank = await this.countDocuments({ rating: { $gt: player.rating } });
  return rank + 1;
};

// Middleware
LeaderboardSchema.pre('save', function(next) {
  if (this.isModified('wins') || this.isModified('losses')) {
    this.lastUpdated = Date.now();
  }
  next();
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
