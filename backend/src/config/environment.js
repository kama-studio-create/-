// src/config/environment.js
require('dotenv').config();

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mythic-warriors',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  
  // Game Settings
  GAME: {
    STARTING_GOLD: 1000,
    STARTING_TICKETS: 5,
    MAX_DECK_SIZE: 30,
    MIN_DECK_SIZE: 20,
    DAILY_REWARD_GOLD: 100,
    TURN_TIMEOUT: 60000, // 60 seconds
    MATCH_TIMEOUT: 300000, // 5 minutes
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Validation
  isProduction: () => config.NODE_ENV === 'production',
  isDevelopment: () => config.NODE_ENV === 'development',
  
  // Required environment variables
  requiredEnvVars: [
    'MONGODB_URI',
    'JWT_SECRET',
    'TELEGRAM_BOT_TOKEN'
  ]
};

// Validate required environment variables
config.requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = config;