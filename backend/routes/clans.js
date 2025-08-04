// Donate to clan
router.post('/donate', async (req, res) => {
  const { userId, amount } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.clanId) return res.status(400).json({ message: 'Not in a clan' });

  if (user.gold < amount) return res.status(400).json({ message: 'Not enough gold' });

  const clan = await Clan.findById(user.clanId);
  clan.treasury += amount;
  await clan.save();

  user.gold -= amount;
  await user.save();

  res.json({ message: `Donated ${amount} gold`, newBalance: user.gold, clanTreasury: clan.treasury });
});

// Post a message to the clan board
router.post('/message', async (req, res) => {
  const { userId, text } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.clanId) return res.status(400).json({ message: 'Not in a clan' });

  const clan = await Clan.findById(user.clanId);
  clan.messages.push({ user: userId, text });
  await clan.save();

  res.json({ message: 'Posted!' });
});
