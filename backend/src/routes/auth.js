const express = require('express');
const router = express.Router();
const { registerTelegramUser, validateTelegramData } = require('../controllers/AuthController');
const User = require('../models/User');

// Constants
const AUTH_EXPIRY = 86400; // 24 hours in seconds

// Custom error handler
const handleError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Middleware to validate Telegram data
const validateTelegramRequest = async (req, res, next) => {
  try {
    const { id, username, first_name, auth_date, hash } = req.body;
    
    // Validate required fields
    if (!id || !auth_date || !hash) {
      return handleError(res, 400, 'Missing required Telegram authentication data');
    }

    // Validate ID format
    if (!/^\d+$/.test(id)) {
      return handleError(res, 400, 'Invalid Telegram ID format');
    }
    
    // Validate auth_date is not expired
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - auth_date > AUTH_EXPIRY) {
      return handleError(res, 401, 'Telegram authentication has expired');
    }

    // Validate hash using imported function
    if (!validateTelegramData({ id, username, first_name, auth_date, hash })) {
      return handleError(res, 401, 'Invalid authentication hash');
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return handleError(res, 500, 'Error validating Telegram data');
  }
};

// Routes
router.post('/telegram-login', 
  validateTelegramRequest,
  async (req, res) => {
    try {
      const result = await registerTelegramUser(req.body);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      return handleError(res, 500, 'Error processing login request');
    }
  }
);

router.get('/profile', 
  validateTelegramRequest,
  async (req, res) => {
    try {
      const user = await User.findOne({ telegramId: req.body.id })
        .select('-__v -createdAt -updatedAt')
        .populate('cards', 'name type rarity')
        .lean();
        
      if (!user) {
        return handleError(res, 404, 'User not found');
      }

      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return handleError(res, 500, 'Error fetching user profile');
    }
  }
);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

/* Test health check
curl http://localhost:3000/api/auth/health

# Test login
curl -X POST http://localhost:3000/api/auth/telegram-login \
  -H "Content-Type: application/json" \
  -d '{"id":"123456789","auth_date":"1628097523","hash":"abcdef"}'

# Test profile
curl http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -d '{"id":"123456789","auth_date":"1628097523","hash":"abcdef"}'
*/
