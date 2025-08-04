const User = require('../models/User'); // Make sure User.js exists

// Register or return existing Telegram user
exports.registerTelegramUser = async (req, res) => {
  try {
    const { id, username, first_name, last_name, photo_url } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ telegramId: id });

    if (!user) {
      // Create new user
      user = new User({
        telegramId: id,
        username,
        firstName: first_name,
        lastName: last_name,
        avatar: photo_url,
        gold: 1000,      // starting gold
        cards: [],       // card inventory
        deck: [],        // saved deck
      });

      await user.save();
    }

    return res.status(200).json({ message: 'User registered', user });

  } catch (error) {
    console.error('[AuthController] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
