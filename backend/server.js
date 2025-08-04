const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Import Models
const BattleHistory = require('./models/BattleHistory');
const Leaderboard = require('./models/Leaderboard');

// Routes
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Game State Management
const activeBattles = {};
const matchmakingQueue = [];

// Utility Functions
const generateHand = (deck) => {
  if (!deck || deck.length === 0) return [];
  const shuffled = [...deck].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

const recordWin = async (userId, username) => {
  try {
    await Leaderboard.findOneAndUpdate(
      { userId },
      { 
        $inc: { wins: 1 }, 
        username, 
        lastUpdated: Date.now() 
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error recording win:', error);
  }
};

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Single Player Battle (vs AI)
  socket.on('joinBattle', ({ userId, deck, username }) => {
    try {
      const hand = generateHand(deck);
      
      activeBattles[socket.id] = {
        userId,
        username: username || 'Anonymous',
        deck,
        hand,
        hp: 30,
        mana: 1,
        turn: true,
        enemyHp: 30,
        battleType: 'ai'
      };

      socket.emit('battleReady', {
        yourHp: 30,
        enemyHp: 30,
        hand,
        mana: 1,
        yourTurn: true
      });

      console.log(`🎮 Battle started: ${username} vs AI`);
    } catch (error) {
      console.error('Error joining battle:', error);
      socket.emit('battleError', { message: 'Failed to join battle' });
    }
  });

  // Multiplayer Matchmaking
  socket.on('joinQueue', ({ userId, deck, username }) => {
    try {
      matchmakingQueue.push({ socket, userId, deck, username });
      socket.emit('queueStatus', { position: matchmakingQueue.length });

      if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();

        const roomId = `battle_${Date.now()}`;
        player1.socket.join(roomId);
        player2.socket.join(roomId);

        const battle = {
          players: {
            [player1.socket.id]: { 
              hp: 30, 
              deck: player1.deck, 
              mana: 1, 
              hand: generateHand(player1.deck), 
              turn: true,
              userId: player1.userId,
              username: player1.username
            },
            [player2.socket.id]: { 
              hp: 30, 
              deck: player2.deck, 
              mana: 1, 
              hand: generateHand(player2.deck), 
              turn: false,
              userId: player2.userId,
              username: player2.username
            }
          },
          roomId,
          battleType: 'pvp'
        };

        activeBattles[roomId] = battle;

        [player1.socket, player2.socket].forEach((s) => {
          s.emit('battleReady', {
            hand: battle.players[s.id].hand,
            yourHp: 30,
            enemyHp: 30,
            mana: 1,
            yourTurn: battle.players[s.id].turn,
            roomId,
            battleType: 'pvp'
          });
        });

        console.log(`⚔️ PvP Battle started: ${player1.username} vs ${player2.username}`);
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      socket.emit('queueError', { message: 'Failed to join matchmaking' });
    }
  });

  // Play Card
  socket.on('playCard', async ({ card, roomId }) => {
    try {
      let battle;
      let isRoomBattle = false;

      if (roomId && activeBattles[roomId]) {
        battle = activeBattles[roomId].players[socket.id];
        isRoomBattle = true;
      } else {
        battle = activeBattles[socket.id];
      }

      if (!battle || !battle.turn) {
        socket.emit('actionError', { message: 'Not your turn' });
        return;
      }

      const cost = card.manaCost || 1;
      if (battle.mana < cost) {
        socket.emit('notEnoughMana', { required: cost, available: battle.mana });
        return;
      }

      // Apply card effects
      battle.mana -= cost;
      const damage = card.attack || 0;

      if (isRoomBattle) {
        // PvP Battle
        const roomBattle = activeBattles[roomId];
        const enemySocketId = Object.keys(roomBattle.players).find(id => id !== socket.id);
        const enemyBattle = roomBattle.players[enemySocketId];
        
        enemyBattle.hp -= damage;

        // Broadcast to both players
        io.to(roomId).emit('cardPlayed', {
          playerId: socket.id,
          card,
          damage,
          playerHp: battle.hp,
          enemyHp: enemyBattle.hp,
          mana: battle.mana
        });

        // Check for victory
        if (enemyBattle.hp <= 0) {
          await recordWin(battle.userId, battle.username);
          await BattleHistory.create({
            player: battle.userId,
            opponent: enemyBattle.userId,
            result: 'win'
          });
          
          io.to(roomId).emit('matchEnd', { 
            winner: socket.id, 
            result: 'win',
            battleType: 'pvp'
          });
          
          delete activeBattles[roomId];
          return;
        }
      } else {
        // AI Battle
        battle.enemyHp -= damage;

        socket.emit('cardPlayed', {
          damage,
          mana: battle.mana,
          enemyHp: battle.enemyHp
        });

        // Check for victory
        if (battle.enemyHp <= 0) {
          await recordWin(battle.userId, battle.username);
          await BattleHistory.create({
            player: battle.userId,
            opponent: 'AI',
            result: 'win'
          });
          
          socket.emit('matchEnd', { result: 'win', battleType: 'ai' });
          delete activeBattles[socket.id];
          return;
        }
      }
    } catch (error) {
      console.error('Error playing card:', error);
      socket.emit('actionError', { message: 'Failed to play card' });
    }
  });

  // End Turn
  socket.on('endTurn', ({ roomId }) => {
    try {
      let battle;
      let isRoomBattle = false;

      if (roomId && activeBattles[roomId]) {
        battle = activeBattles[roomId].players[socket.id];
        isRoomBattle = true;
      } else {
        battle = activeBattles[socket.id];
      }

      if (!battle) return;

      battle.turn = false;
      battle.mana = Math.min(battle.mana + 1, 10); // Max 10 mana

      if (isRoomBattle) {
        // PvP: Switch turns
        const roomBattle = activeBattles[roomId];
        const enemySocketId = Object.keys(roomBattle.players).find(id => id !== socket.id);
        const enemyBattle = roomBattle.players[enemySocketId];
        
        enemyBattle.turn = true;
        enemyBattle.mana = Math.min(enemyBattle.mana + 1, 10);

        io.to(roomId).emit('turnChanged', {
          currentPlayer: enemySocketId,
          mana: {
            [socket.id]: battle.mana,
            [enemySocketId]: enemyBattle.mana
          }
        });
      } else {
        // AI Battle: Simulate AI turn
        socket.emit('turnStatus', { yourTurn: false, mana: battle.mana });

        setTimeout(async () => {
          if (!activeBattles[socket.id]) return; // Battle may have ended

          // Simple AI logic
          const aiCard = battle.deck.find(c => c.attack > 0) || { attack: 2, name: 'AI Strike' };
          const aiDamage = aiCard.attack || 2;
          
          battle.hp -= aiDamage;

          socket.emit('enemyMove', { 
            card: aiCard, 
            damage: aiDamage, 
            yourHp: battle.hp 
          });

          // Check if player lost
          if (battle.hp <= 0) {
            await BattleHistory.create({
              player: battle.userId,
              opponent: 'AI',
              result: 'lose'
            });
            
            socket.emit('matchEnd', { result: 'lose', battleType: 'ai' });
            delete activeBattles[socket.id];
            return;
          }

          // Give turn back to player
          battle.turn = true;
          socket.emit('turnStatus', { yourTurn: true, mana: battle.mana });
        }, 2000);
      }
    } catch (error) {
      console.error('Error ending turn:', error);
      socket.emit('actionError', { message: 'Failed to end turn' });
    }
  });

  // Leave Queue
  socket.on('leaveQueue', () => {
    const index = matchmakingQueue.findIndex(p => p.socket.id === socket.id);
    if (index !== -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit('queueLeft');
    }
  });

  // Disconnect Handling
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    
    // Remove from active battles
    delete activeBattles[socket.id];
    
    // Remove from matchmaking queue
    const queueIndex = matchmakingQueue.findIndex(p => p.socket.id === socket.id);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
    }

    // Handle room battles
    Object.keys(activeBattles).forEach(roomId => {
      const battle = activeBattles[roomId];
      if (battle.players && battle.players[socket.id]) {
        // Notify other player
        const enemySocketId = Object.keys(battle.players).find(id => id !== socket.id);
        if (enemySocketId) {
          io.to(enemySocketId).emit('opponentDisconnected');
        }
        delete activeBattles[roomId];
      }
    });
  });
});

// Import background jobs
require('./jobs/monthlyLeagueReward');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.IO enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Telegram Web App
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  
  // Optional: Set theme colors
  window.Telegram.WebApp.setHeaderColor('#1a1b3a');
  window.Telegram.WebApp.setBackgroundColor('#0f0f23');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);