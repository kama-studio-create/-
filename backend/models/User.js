const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Constants
const USER_CONSTANTS = {
  STARTING_GOLD: 1000,
  STARTING_TICKETS: 5,
  MAX_DECK_SIZE: 30,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 32,
  DAILY_REWARD_GOLD: 100,
  DAILY_REWARD_COOLDOWN: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

const UserSchema = new Schema({
  telegramId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  username: { 
    type: String,
    trim: true,
    minLength: USER_CONSTANTS.MIN_USERNAME_LENGTH,
    maxLength: USER_CONSTANTS.MAX_USERNAME_LENGTH
  },
  firstName: { 
    type: String, 
    trim: true 
  },
  lastName: { 
    type: String, 
    trim: true 
  },
  avatar: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid avatar URL format'
    }
  },
  // Game Resources
  gold: { 
    type: Number, 
    default: USER_CONSTANTS.STARTING_GOLD,
    min: 0 
  },
  pvpTickets: { 
    type: Number, 
    default: USER_CONSTANTS.STARTING_TICKETS,
    min: 0 
  },
  tokens: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  // VIP System
  vipMonths: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  vipExpiry: {
    type: Date,
    default: null
  },
  // Card Collection
  cards: [{ 
    cardId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Card' 
    },
    quantity: { 
      type: Number, 
      default: 1,
      min: 1 
    }
  }],
  // Active Deck
  deck: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Card',
    validate: [
      {
        validator: function(v) {
          return v.length <= USER_CONSTANTS.MAX_DECK_SIZE;
        },
        message: `Deck cannot exceed ${USER_CONSTANTS.MAX_DECK_SIZE} cards`
      }
    ]
  }],
  // Game Statistics
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalHealingDone: { type: Number, default: 0 },
    cardsPlayed: { type: Number, default: 0 },
    longestWinStreak: { type: Number, default: 0 },
    currentWinStreak: { type: Number, default: 0 }
  },
  // Daily Rewards
  lastDailyClaim: { 
    type: Date, 
    default: null 
  },
  dailyStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  // Social Features
  clanId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Clan',
    index: true
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Achievements
  achievements: [{
    achievementId: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  // Settings
  settings: {
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    autoPlay: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  },
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  },
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for Performance
UserSchema.index({ username: 'text' });
UserSchema.index({ lastActive: -1 });
UserSchema.index({ 'stats.gamesWon': -1 });
UserSchema.index({ gold: -1 });
UserSchema.index({ lastDailyClaim: 1 });

// Virtual Properties
UserSchema.virtual('isVIP').get(function() {
  return this.vipMonths > 0 && (!this.vipExpiry || this.vipExpiry > new Date());
});

UserSchema.virtual('displayName').get(function() {
  return this.username || `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

UserSchema.virtual('winRate').get(function() {
  const totalGames = this.stats.gamesPlayed;
  return totalGames > 0 ? (this.stats.gamesWon / totalGames * 100).toFixed(2) : 0;
});

UserSchema.virtual('totalCards').get(function() {
  return this.cards.reduce((total, card) => total + card.quantity, 0);
});

// Instance Methods
UserSchema.methods.addCard = async function(cardId, quantity = 1) {
  const existingCard = this.cards.find(c => c.cardId.toString() === cardId.toString());
  
  if (existingCard) {
    existingCard.quantity += quantity;
  } else {
    this.cards.push({ cardId, quantity });
  }
  
  return this.save();
};

UserSchema.methods.removeCard = async function(cardId, quantity = 1) {
  const cardIndex = this.cards.findIndex(c => c.cardId.toString() === cardId.toString());
  
  if (cardIndex === -1) {
    throw new Error('Card not found in collection');
  }
  
  const card = this.cards[cardIndex];
  if (card.quantity < quantity) {
    throw new Error('Insufficient card quantity');
  }
  
  card.quantity -= quantity;
  if (card.quantity === 0) {
    this.cards.splice(cardIndex, 1);
  }
  
  return this.save();
};

UserSchema.methods.updateDeck = async function(cardIds) {
  if (cardIds.length > USER_CONSTANTS.MAX_DECK_SIZE) {
    throw new Error(`Deck cannot exceed ${USER_CONSTANTS.MAX_DECK_SIZE} cards`);
  }
  
  // Verify all cards are owned by user
  for (const cardId of cardIds) {
    const ownedCard = this.cards.find(c => c.cardId.toString() === cardId.toString());
    if (!ownedCard) {
      throw new Error('Deck contains cards not owned by user');
    }
  }

  this.deck = cardIds;
  return this.save();
};

UserSchema.methods.addGold = async function(amount) {
  if (amount < 0) throw new Error('Cannot add negative gold');
  this.gold += amount;
  return this.save();
};

UserSchema.methods.spendGold = async function(amount) {
  if (amount < 0) throw new Error('Cannot spend negative gold');
  if (this.gold < amount) throw new Error('Insufficient gold');
  
  this.gold -= amount;
  return this.save();
};

UserSchema.methods.claimDailyReward = async function() {
  const now = new Date();
  const lastClaim = this.lastDailyClaim;
  
  // Check if daily reward is available
  if (lastClaim && (now.getTime() - lastClaim.getTime()) < USER_CONSTANTS.DAILY_REWARD_COOLDOWN) {
    const timeLeft = USER_CONSTANTS.DAILY_REWARD_COOLDOWN - (now.getTime() - lastClaim.getTime());
    const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
    throw new Error(`Daily reward already claimed. Next reward in ${hoursLeft} hours.`);
  }
  
  // Check if streak continues (within 48 hours)
  const streakContinues = lastClaim && (now.getTime() - lastClaim.getTime()) <= (48 * 60 * 60 * 1000);
  
  if (streakContinues) {
    this.dailyStreak += 1;
  } else {
    this.dailyStreak = 1;
  }
  
  // Calculate reward based on streak
  const baseReward = USER_CONSTANTS.DAILY_REWARD_GOLD;
  const streakBonus = Math.min(this.dailyStreak - 1, 6) * 10; // Max 60 bonus gold
  const totalReward = baseReward + streakBonus;
  
  this.gold += totalReward;
  this.lastDailyClaim = now;
  
  await this.save();
  
  return {
    goldEarned: totalReward,
    streak: this.dailyStreak,
    streakBonus
  };
};

UserSchema.methods.updateGameStats = async function(won, damageDealt = 0, healingDone = 0, cardsPlayed = 0) {
  this.stats.gamesPlayed += 1;
  this.stats.totalDamageDealt += damageDealt;
  this.stats.totalHealingDone += healingDone;
  this.stats.cardsPlayed += cardsPlayed;
  
  if (won) {
    this.stats.gamesWon += 1;
    this.stats.currentWinStreak += 1;
    this.stats.longestWinStreak = Math.max(this.stats.longestWinStreak, this.stats.currentWinStreak);
  } else {
    this.stats.gamesLost += 1;
    this.stats.currentWinStreak = 0;
  }
  
  return this.save();
};

UserSchema.methods.unlockAchievement = async function(achievementId) {
  const existingAchievement = this.achievements.find(a => a.achievementId === achievementId);
  if (!existingAchievement) {
    this.achievements.push({ achievementId });
    await this.save();
    return true;
  }
  return false;
};

UserSchema.methods.addFriend = async function(userId) {
  if (!this.friends.includes(userId) && userId.toString() !== this._id.toString()) {
    this.friends.push(userId);
    await this.save();
  }
  return this;
};

// Middleware
UserSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  
  // Update VIP status
  if (this.vipMonths > 0 && !this.vipExpiry) {
    this.vipExpiry = new Date(Date.now() + (this.vipMonths * 30 * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Static Methods
UserSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId })
    .populate('cards.cardId')
    .populate('deck');
};

UserSchema.statics.getTopPlayers = function(limit = 10) {
  return this.find()
    .sort({ 'stats.gamesWon': -1, gold: -1 })
    .limit(limit)
    .select('username displayName stats gold avatar');
};

UserSchema.statics.getLeaderboard = function(type = 'wins', limit = 10) {
  const sortOptions = {
    wins: { 'stats.gamesWon': -1 },
    gold: { gold: -1 },
    winrate: { 'stats.gamesWon': -1 }, // We'll filter by games played > 10
    streak: { 'stats.longestWinStreak': -1 }
  };
  
  let query = this.find();
  
  if (type === 'winrate') {
    query = query.where('stats.gamesPlayed').gte(10);
  }
  
  return query
    .sort(sortOptions[type] || sortOptions.wins)
    .limit(limit)
    .select('username displayName stats gold avatar');
};

UserSchema.statics.getActiveUsers = function(days = 7) {
  const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return this.find({ lastActive: { $gte: cutoffDate } })
    .sort({ lastActive: -1 });
};

module.exports = mongoose.model('User', UserSchema);