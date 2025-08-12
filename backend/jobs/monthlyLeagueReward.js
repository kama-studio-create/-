const cron = require('node-cron');
const ReferenceLeagueEntry = require('./models/ReferenceLeagueEntry');
const User = require('./models/User');

// Define reward tiers as constants
const REWARDS = {
  FIRST_PLACE: { vipMonths: 1, pvpTickets: 100, gold: 2000 },
  SECOND_PLACE: { vipMonths: 1, pvpTickets: 75, gold: 1500 },
  THIRD_PLACE: { vipMonths: 1, pvpTickets: 50, gold: 1000 },
  TOP_10: { pvpTickets: 30, gold: 750 },
  TOP_30: { pvpTickets: 20, gold: 500 },
  TOP_100: { pvpTickets: 10, gold: 250 }
};

// 🏆 Runs on 1st of every month at 00:00
cron.schedule('0 0 1 * *', async () => {
  console.log('Processing monthly league rewards...');
  
  try {
    const entries = await ReferenceLeagueEntry.find()
      .sort({ totalPoints: -1 })
      .limit(100)
      .populate('user');

    for (let i = 0; i < entries.length; i++) {
      try {
        const entry = entries[i];
        const user = await User.findById(entry.user);

        if (!user) {
          console.warn(`User not found for entry ${entry._id}`);
          continue;
        }

        // Apply rewards based on position
        if (i === 0) applyReward(user, REWARDS.FIRST_PLACE);
        else if (i === 1) applyReward(user, REWARDS.SECOND_PLACE);
        else if (i === 2) applyReward(user, REWARDS.THIRD_PLACE);
        else if (i <= 8) applyReward(user, REWARDS.TOP_10);
        else if (i <= 28) applyReward(user, REWARDS.TOP_30);
        else if (i <= 99) applyReward(user, REWARDS.TOP_100);

        await user.save();
      } catch (userError) {
        console.error(`Error processing user ${entries[i].user}:`, userError);
      }
    }

    await ReferenceLeagueEntry.deleteMany({});
    console.log('Monthly league reset and rewards sent!');
  } catch (error) {
    console.error('Failed to process monthly league rewards:', error);
  }
});

function applyReward(user, reward) {
  if (reward.vipMonths) {
    user.vipMonths = (user.vipMonths || 0) + reward.vipMonths;
  }
  user.pvpTickets += reward.pvpTickets;
  user.gold += reward.gold;
}

const notifyUser = async (user, reward) => {
  try {
    // Implement your notification logic here
    await bot.sendMessage(user.telegramId, 
      `🎉 Monthly League Rewards:\n` +
      `💰 Gold: ${reward.gold}\n` +
      `🎟️ PVP Tickets: ${reward.pvpTickets}\n` +
      `${reward.vipMonths ? `👑 VIP Months: +${reward.vipMonths}\n` : ''}`
    );
  } catch (error) {
    console.error(`Failed to notify user ${user._id}:`, error);
  }
};

const validateLeagueEntry = (entry) => {
  return entry && 
         entry.user && 
         entry.totalPoints >= 0;
};
