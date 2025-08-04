// utils/leaguePayout.js

const User = require('../models/User');
const Referral = require('../models/Referral');
const { sendNotification } = require('./notify'); // optional

async function runReferenceLeague() {
  const users = await User.find({});
  const leaderboard = [];

  for (const user of users) {
    const validRefs = await Referral.find({
      referrer: user._id,
      isValid: true,
    });

    let score = validRefs.length;

    // +3 bonus for token spenders
    for (const ref of validRefs) {
      if (ref.spentOver10) score += 3;
    }

    if (score > 0) {
      leaderboard.push({ user, score });
    }
  }

  // Sort by score
  leaderboard.sort((a, b) => b.score - a.score);

  // Assign rewards
  for (let i = 0; i < leaderboard.length; i++) {
    const { user, score } = leaderboard[i];
    let reward = {};

    if (i === 0) reward = { vip: 1, pvp: 100, gold: 2000 };
    else if (i === 1) reward = { vip: 1, pvp: 75, gold: 1500 };
    else if (i === 2) reward = { vip: 1, pvp: 50, gold: 1000 };
    else if (i < 10) reward = { tickets: 30, gold: 750 };
    else if (i < 30) reward = { tickets: 20, gold: 500 };
    else if (i < 100) reward = { tickets: 10, gold: 250 };

    // Apply to user (pseudo logic)
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        gold: reward.gold || 0,
        pvpTickets: reward.tickets || reward.pvp || 0,
      },
      vipUntil: reward.vip
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : user.vipUntil,
    });

    sendNotification(user._id, `🏆 You earned ${reward.gold} Gold + bonuses!`);
  }

  console.log(`✅ League payouts done for ${leaderboard.length} users`);
}

module.exports = runReferenceLeague;
