const mongoose = require('mongoose');

const ReferenceLeagueEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pvpPoints: { type: Number, default: 0 },
  referralPoints: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 }, // Calculated as pvp + referral
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReferenceLeagueEntry', ReferenceLeagueEntrySchema);
