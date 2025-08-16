const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Constants
const POINTS = {
  PVP_WIN: 10,
  REFERRAL: 50,
  MAX_REFERRALS: 10,
  DAILY_LIMIT: 100
};

const ReferenceLeagueEntrySchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  pvpPoints: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  referralPoints: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  totalPoints: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  referrals: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    validate: {
      validator: function(v) {
        return v.length <= POINTS.MAX_REFERRALS;
      },
      message: `Cannot exceed ${POINTS.MAX_REFERRALS} referrals`
    }
  }],
  dailyPoints: {
    amount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  rank: {
    type: Number,
    default: 0
  },
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
ReferenceLeagueEntrySchema.index({ totalPoints: -1 });
ReferenceLeagueEntrySchema.index({ 'dailyPoints.lastUpdated': 1 });

// Methods
ReferenceLeagueEntrySchema.methods.addPvPPoints = async function(points) {
  const today = new Date().setHours(0, 0, 0, 0);
  
  if (this.dailyPoints.lastUpdated < today) {
    this.dailyPoints = { amount: 0, lastUpdated: new Date() };
  }

  if (this.dailyPoints.amount >= POINTS.DAILY_LIMIT) {
    return false;
  }

  const pointsToAdd = Math.min(
    points, 
    POINTS.DAILY_LIMIT - this.dailyPoints.amount
  );

  this.pvpPoints += pointsToAdd;
  this.totalPoints += pointsToAdd;
  this.dailyPoints.amount += pointsToAdd;
  this.lastActive = new Date();

  return this.save();
};

ReferenceLeagueEntrySchema.methods.addReferral = async function(referralId) {
  if (this.referrals.includes(referralId)) {
    throw new Error('User already referred');
  }

  if (this.referrals.length >= POINTS.MAX_REFERRALS) {
    throw new Error(`Maximum ${POINTS.MAX_REFERRALS} referrals reached`);
  }

  this.referrals.push(referralId);
  this.referralPoints += POINTS.REFERRAL;
  this.totalPoints += POINTS.REFERRAL;
  
  return this.save();
};

// Statics
ReferenceLeagueEntrySchema.statics.getTopPlayers = function(limit = 10) {
  return this.find()
    .sort({ totalPoints: -1 })
    .limit(limit)
    .populate('user', 'username')
    .select('totalPoints pvpPoints referralPoints');
};

ReferenceLeagueEntrySchema.statics.updateRanks = async function() {
  const entries = await this.find()
    .sort({ totalPoints: -1 });

  const updates = entries.map((entry, index) => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { rank: index + 1 }
    }
  }));

  return this.bulkWrite(updates);
};

// Pre-save middleware
ReferenceLeagueEntrySchema.pre('save', function(next) {
  this.totalPoints = this.pvpPoints + this.referralPoints;
  next();
});

module.exports = mongoose.model('ReferenceLeagueEntry', ReferenceLeagueEntrySchema);
