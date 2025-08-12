const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with better error handling
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  connectTimeout: 10000
});

// Enhanced middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import models
const User = require('./models/User');
// const Card = require('./models/Card'); // Uncomment when you create this model

// MongoDB Connection with retry logic
async function connectDB(retries = 5) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cardgame', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    if (retries > 0) {
      console.log(`❌ MongoDB connection failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    console.error('❌ MongoDB connection failed after all retries:', err);
    process.exit(1);
  }
}

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server connected to MongoDB!' });
});

// Daily reward endpoints
app.get('/api/daily/status/:userId', async (req, res) => {
  try {
    const user = await User.findByTelegramId(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const lastClaim = user.lastDailyClaim || new Date(0);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const claimed = lastClaim >= today;
    
    // Calculate time until next reward (tomorrow at midnight)
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilNext = claimed ? tomorrow - now : 0;
    
    res.json({ claimed, timeUntilNext });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/daily/claim', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByTelegramId(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already claimed today
    const lastClaim = user.lastDailyClaim || new Date(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastClaim >= today) {
      return res.status(400).json({ error: 'Already claimed today' });
    }
    
    // Calculate reward
    const baseGold = 100;
    const baseTickets = 1;
    const reward = {
      gold: user.isVIP ? baseGold * 2 : baseGold,
      tickets: user.isVIP ? baseTickets * 2 : baseTickets
    };
    
    // Update user using your schema methods
    await user.addGold(reward.gold);
    user.pvpTickets += reward.tickets;
    user.lastDailyClaim = new Date();
    await user.save();
    
    // Time until next reward
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    res.json({ 
      reward, 
      timeUntilNext: tomorrow - new Date(),
      message: 'Daily reward claimed!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User endpoints
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const user = await User.findByTelegramId(req.params.telegramId)
      .populate('cards')
      .populate('deck');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user endpoint
app.post('/api/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deck endpoints
app.post('/api/deck/save', async (req, res) => {
  try {
    const { userId, deck } = req.body;
    const user = await User.findByTelegramId(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.updateDeck(deck); // Uses your schema method
    res.json({ message: 'Deck saved successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cards endpoint (uncomment when you have Card model)
/*
app.get('/api/cards/all', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// Start server with enhanced error handling
async function startServer() {
  try {
    await connectDB();

    // Comment out routes that don't exist yet
    /*
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/cards', require('./routes/cards'));
    app.use('/api/deck', require('./routes/deck'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/tournament', require('./routes/tournamentRoutes'));
    app.use('/api/Leaderboard', require('./routes/Leaderboard'));
    app.use('/api/daily', require('./routes/daily'));
    app.use('/api/clans', require('./routes/clans'));
    app.use('/api/marketplace', require('./routes/marketplace'));
    app.use('/api/league', require('./routes/league'));
    */

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('❌ Server Error:', err);
      res.status(err.status || 500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    // Start listening
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📡 Socket.IO enabled
      `);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
function handleShutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('📦 MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
}

// Process handlers
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

module.exports = { app, server, io };