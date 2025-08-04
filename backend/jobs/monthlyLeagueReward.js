const cron = require('node-cron');
const ReferenceLeagueEntry = require('./models/ReferenceLeagueEntry');
const User = require('./models/User');

// 🏆 Runs on 1st of every month at 00:00
cron.schedule('0 0 1 * *', async () => {
  console.log('Processing monthly league rewards...');

  const entries = await ReferenceLeagueEntry.find().sort({ totalPoints: -1 }).limit(100);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const user = await User.findById(entry.user);

    if (!user) continue;

    // Reward logic by rank
    if (i === 0) {
      user.vipMonths = (user.vipMonths || 0) + 1;
      user.pvpTickets += 100;
      user.gold += 2000;
    } else if (i === 1) {
      user.vipMonths += 1;
      user.pvpTickets += 75;
      user.gold += 1500;
    } else if (i === 2) {
      user.vipMonths += 1;
      user.pvpTickets += 50;
      user.gold += 1000;
    } else if (i <= 8) {
      user.pvpTickets += 30;
      user.gold += 750;
    } else if (i <= 28) {
      user.pvpTickets += 20;
      user.gold += 500;
    } else if (i <= 99) {
      user.pvpTickets += 10;
      user.gold += 250;
    }

    await user.save();
  }

  // Clear league entries for the new month
  await ReferenceLeagueEntry.deleteMany({});
  console.log('Monthly league reset and rewards sent!');
});
