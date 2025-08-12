const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Constants for daily rewards and streaks
const DAILY_CONSTANTS = {
  BASE_GOLD: 100,
  STREAK_BONUS: 20,
  MAX_STREAK: 7,
  CLAIM_WINDOW: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  STREAK_WINDOW: 48 * 60 * 60 * 1000  // 48 hours for streak maintenance
};

const UserDailySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lastClaimed: { 
    type: Date, 
    default: null,
    index: true // Add index for performance
  },
  streak: {
    type: Number,
    default: 0,
    min: 0,
    max: DAILY_CONSTANTS.MAX_STREAK,
    validate: {
      validator: Number.isInteger,
      message: 'Streak must be an integer'
    }
  },
  totalClaims: {
    type: Number,
    default: 0,
    min: 0
  },
  lastReward: {
    gold: {
      type: Number,
      min: 0,
      required: true,
      default: 0
    },
    bonus: {
      type: Number,
      min: 0,
      required: true,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for query optimization
UserDailySchema.index({ 'lastReward.timestamp': -1 });
UserDailySchema.index({ streak: -1 });

// Virtual for next claim time
UserDailySchema.virtual('nextClaimTime').get(function() {
  if (!this.lastClaimed) return new Date();
  return new Date(this.lastClaimed.getTime() + DAILY_CONSTANTS.CLAIM_WINDOW);
});

// Virtual for time until next claim
UserDailySchema.virtual('timeUntilClaim').get(function() {
  if (this.canClaim) return 0;
  return Math.max(0, this.nextClaimTime - Date.now());
});

// Virtual for can claim status
UserDailySchema.virtual('canClaim').get(function() {
  if (!this.lastClaimed) return true;
  return Date.now() >= this.nextClaimTime;
});

// Methods
UserDailySchema.methods.processClaim = async function() {
  const now = new Date();

  if (!this.canClaim) {
    const timeLeft = Math.ceil(this.timeUntilClaim / (60 * 1000)); // Convert to minutes
    throw new Error(`Daily reward already claimed. Try again in ${timeLeft} minutes`);
  }

  // Calculate streak
  if (this.lastClaimed) {
    const timeSinceLastClaim = now - this.lastClaimed;
    if (timeSinceLastClaim <= DAILY_CONSTANTS.STREAK_WINDOW) {
      this.streak = Math.min(this.streak + 1, DAILY_CONSTANTS.MAX_STREAK);
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.streak = 0; // Reset streak if outside window
    }
  }

  // Calculate reward with bonus multiplier
  const baseReward = DAILY_CONSTANTS.BASE_GOLD;
  const streakBonus = this.streak * DAILY_CONSTANTS.STREAK_BONUS;
  const totalReward = baseReward + streakBonus;

  // Update claim data
  this.lastClaimed = now;
  this.totalClaims += 1;
  this.lastReward = {
    gold: baseReward,
    bonus: streakBonus,
    timestamp: now
  };

  await this.save();

  return {
    gold: totalReward,
    streak: this.streak,
    bestStreak: this.bestStreak,
    nextClaim: this.nextClaimTime,
    breakdown: {
      base: baseReward,
      bonus: streakBonus
    },
    totalClaims: this.totalClaims
  };
};

// Statics
UserDailySchema.statics.getClaimStatus = async function(userId) {
  const daily = await this.findOne({ userId });
  if (!daily) {
    return { 
      canClaim: true, 
      nextClaimTime: new Date(),
      streak: 0,
      bestStreak: 0
    };
  }
  return {
    canClaim: daily.canClaim,
    nextClaimTime: daily.nextClaimTime,
    timeUntilClaim: daily.timeUntilClaim,
    streak: daily.streak,
    bestStreak: daily.bestStreak,
    totalClaims: daily.totalClaims
  };
};

// Pre-save middleware
UserDailySchema.pre('save', function(next) {
  // Update bestStreak if current streak is higher
  if (this.streak > this.bestStreak) {
    this.bestStreak = this.streak;
  }
  next();
});

module.exports = mongoose.model('UserDaily', UserDailySchema);
