const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TOURNAMENT_CONSTANTS = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 32,
  REGISTRATION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

const TournamentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50
  },
  players: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  matches: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Match' 
  }],
  status: { 
    type: String, 
    enum: ['registering', 'waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'registering',
    index: true
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  prizePool: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  }
}, {
  timestamps: true
});

// Indexes
TournamentSchema.index({ status: 1, createdAt: -1 });
TournamentSchema.index({ startTime: 1 });

// Virtual properties
TournamentSchema.virtual('playerCount').get(function() {
  return this.players.length;
});

TournamentSchema.virtual('isRegistrationOpen').get(function() {
  return this.status === 'registering' && 
         this.players.length < TOURNAMENT_CONSTANTS.MAX_PLAYERS;
});

// Methods
TournamentSchema.methods.registerPlayer = async function(playerId) {
  if (!this.isRegistrationOpen) {
    throw new Error('Tournament registration is closed');
  }
  
  if (this.players.includes(playerId)) {
    throw new Error('Player already registered');
  }

  this.players.push(playerId);
  
  if (this.players.length >= TOURNAMENT_CONSTANTS.MIN_PLAYERS) {
    this.status = 'waiting';
  }
  
  return this.save();
};

TournamentSchema.methods.start = async function() {
  if (this.status !== 'waiting' || this.players.length < TOURNAMENT_CONSTANTS.MIN_PLAYERS) {
    throw new Error('Tournament cannot be started');
  }
  
  this.status = 'in_progress';
  this.startTime = Date.now();
  return this.save();
};

TournamentSchema.methods.complete = async function(winnerId) {
  if (this.status !== 'in_progress') {
    throw new Error('Tournament is not in progress');
  }
  
  this.status = 'completed';
  this.winner = winnerId;
  this.endTime = Date.now();
  return this.save();
};

// Statics
TournamentSchema.statics.getActiveTournaments = function() {
  return this.find({
    status: { $in: ['registering', 'waiting', 'in_progress'] }
  })
  .sort({ createdAt: -1 })
  .populate('players', 'username');
};

module.exports = mongoose.model('Tournament', TournamentSchema);
