const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Database Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mythic-warriors',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '24h',
  
  // CORS and Security
  frontendUrl: process.env.FRONTEND_URL || '*',
  
  // Telegram Integration
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,

  // Game Configuration
  game: {
    turnTimeout: 60 * 1000, // 60 seconds
    matchTimeout: 5 * 60 * 1000, // 5 minutes
    maxDeckSize: 30,
    minDeckSize: 20,
    startingGold: 1000,
    startingTickets: 5,
    dailyRewardGold: 100,
    dailyRewardCooldown: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

module.exports = config;
