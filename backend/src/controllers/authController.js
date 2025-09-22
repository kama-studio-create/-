const User = require('../models/User');

exports.registerTelegramUser = async (req, res) => {
  try {
    const { id, username, first_name, last_name, photo_url } = req.body;

    // Enhanced input validation
    if (!id || typeof id !== 'number') {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }

    if (username && typeof username !== 'string') {
      return res.status(400).json({ error: 'Username must be a string' });
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

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        telegramId: user.telegramId,
        username: user.username,
        gold: user.gold
      }
    });

  } catch (error) {
    console.error('[AuthController] Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid user data' });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({ error: 'User already exists' });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.validateTelegramData = (data) => {
  // ...existing code...
};
