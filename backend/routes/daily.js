const express = require('express');
const router = express.Router();
const UserDaily = require('../models/UserDaily');
const User = require('../models/User');

// Constants
const DAILY_REWARDS = {
  GOLD: 100,
  BONUS_STREAK: 20, // Additional gold per day streak
  MAX_STREAK: 7
};

const ONE_DAY = 24 * 60 * 60 * 1000;

// Error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

router.post('/claim', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return handleError(res, 400, 'User ID is required');
    }

    const now = new Date();
    const existing = await UserDaily.findOne({ userId });
    
    // Check if already claimed
    if (existing && existing.lastClaimed) {
      const last = new Date(existing.lastClaimed);
      const diff = now - last;

      if (diff < ONE_DAY) {
        const nextClaimTime = new Date(last.getTime() + ONE_DAY);
        return handleError(res, 403, {
          message: 'Already claimed today',
          nextClaim: nextClaimTime
        });
      }
    }

    // Calculate streak
    let streak = 1;
    if (existing && existing.streak) {
      const daysSinceLastClaim = Math.floor((now - existing.lastClaimed) / ONE_DAY);
      streak = daysSinceLastClaim === 1 ? Math.min(existing.streak + 1, DAILY_REWARDS.MAX_STREAK) : 1;
    }

    // Calculate reward
    const baseReward = DAILY_REWARDS.GOLD;
    const streakBonus = (streak - 1) * DAILY_REWARDS.BONUS_STREAK;
    const totalReward = baseReward + streakBonus;

    // Update user's gold and daily claim in a transaction
    const session = await UserDaily.startSession();
    try {
      await session.withTransaction(async () => {
        // Update daily claim
        await UserDaily.findOneAndUpdate(
          { userId },
          { 
            lastClaimed: now,
            streak: streak
          },
          { upsert: true, session }
        );

        // Update user's gold
        await User.findByIdAndUpdate(
          userId,
          { $inc: { gold: totalReward } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.json({
      success: true,
      data: {
        gold: totalReward,
        streak: streak,
        nextClaim: new Date(now.getTime() + ONE_DAY),
        breakdown: {
          base: baseReward,
          streak: streakBonus
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily claim error:', error);
    return handleError(res, 500, 'Error processing daily claim');
  }
});

module.exports = router;
