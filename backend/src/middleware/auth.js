const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };

// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('telegramId')
      .notEmpty()
      .withMessage('Telegram ID is required')
      .isNumeric()
      .withMessage('Telegram ID must be numeric'),
    handleValidationErrors
  ],
  
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    handleValidationErrors
  ]
};

// Deck validation rules
const deckValidation = {
  save: [
    body('cards')
      .isArray({ min: 20, max: 30 })
      .withMessage('Deck must contain between 20 and 30 cards'),
    body('cards.*')
      .isMongoId()
      .withMessage('Invalid card ID'),
    handleValidationErrors
  ]
};

// Tournament validation rules
const tournamentValidation = {
  join: [
    body('tournamentId')
      .isMongoId()
      .withMessage('Invalid tournament ID'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  userValidation,
  deckValidation,
  tournamentValidation
};