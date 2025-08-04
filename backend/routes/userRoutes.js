const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Card = require('../models/Card');
const ReferenceLeagueEntry = require('../models/ReferenceLeagueEntry');

// 🧠 GET user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    const cardCount = await Card.countDocuments({ owner: user._id });
    const referral = await ReferenceLeagueEntry.findOne({ user: user._id });

    res.json({
      username: user.username,
      gold: user.gold,
      pvpTickets: user.pvpTickets,
      vipMonths: user.vipMonths || 0,
      cardCount,
      referralPoints: referral?.referralPoints || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
GET /api/users/profile/USER_ID
