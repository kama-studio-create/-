const express = require('express');
const router = express.Router();
const UserDaily = require('../models/UserDaily');

router.post('/claim', async (req, res) => {
  const { userId } = req.body;
  const now = new Date();

  const existing = await UserDaily.findOne({ userId });

  if (existing && existing.lastClaimed) {
    const last = new Date(existing.lastClaimed);
    const diff = now - last;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay) {
      return res.status(403).json({ message: 'Already claimed today' });
    }
  }

  await UserDaily.findOneAndUpdate(
    { userId },
    { lastClaimed: now },
    { upsert: true }
  );

  // TODO: Update player's gold here too
  return res.json({ success: true, gold: 100 });
});

module.exports = router;
