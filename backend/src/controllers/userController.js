const User = require('../models/User');
const UserDaily = require('../models/UserDaily');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const userController = {
  // Get user profile
  getProfile: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-__v')
      .populate('deck', 'name type rarity imageUrl');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  }),

  // Update user profile
  updateProfile: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  }),

  // Get user stats
  getStats: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const stats = {
      ...user.stats,
      winRate: user.winRate,
      totalCards: user.totalCards,
      level: user.level,
      isVIP: user.isVIP
    };

    res.json({
      success: true,
      data: stats
    });
  }),

  // Claim daily reward
  claimDailyReward: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get or create daily record
    let daily = await UserDaily.findOne({ userId: id });
    if (!daily) {
      daily = new UserDaily({ userId: id });
    }

    const reward = await daily.processClaim();
    await user.addGold(reward.gold);

    res.json({
      success: true,
      data: reward,
      message: 'Daily reward claimed successfully'
    });
  }),

  // Get leaderboard position
  getLeaderboardPosition: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const betterPlayers = await User.countDocuments({
      'stats.gamesWon': { $gt: user.stats.gamesWon }
    });

    res.json({
      success: true,
      data: {
        rank: betterPlayers + 1,
        wins: user.stats.gamesWon,
        winRate: user.winRate
      }
    });
  })
};

module.exports = userController;