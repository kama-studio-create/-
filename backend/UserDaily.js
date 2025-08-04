const mongoose = require('mongoose');

const UserDailySchema = new mongoose.Schema({
  userId: String,
  lastClaimed: { type: Date, default: null }
});

module.exports = mongoose.model('UserDaily', UserDailySchema);
