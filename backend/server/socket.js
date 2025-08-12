// socket.js

const Match = require('../models/Match');
const User = require('../models/User');

// Constants
const TURN_TIMEOUT = 60 * 1000; // 60 seconds
const MAX_MESSAGE_LENGTH = 200;
const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

module.exports = function (io) {
  const activeMatches = new Map();
  const turnTimers = new Map();
  const inactiveTimers = new Map();

  // Match state validation with enhanced error handling
  const validateMatchState = async (matchId, playerId) => {
    const match = await Match.findById(matchId)
      .populate('player1', 'username')
      .populate('player2', 'username');
      
    if (!match) throw new Error('Match not found');
    if (match.status !== 'in_progress') throw new Error('Match is not active');
    if (![match.player1._id.toString(), match.player2._id.toString()].includes(playerId)) {
      throw new Error('Player not in this match');
    }
    return match;
  };

  // Handle match cleanup
  const cleanupMatch = async (matchId, reason) => {
    clearTimeout(turnTimers.get(matchId));
    clearTimeout(inactiveTimers.get(matchId));
    turnTimers.delete(matchId);
    inactiveTimers.delete(matchId);
    
    const matchState = activeMatches.get(matchId);
    if (matchState) {
      activeMatches.delete(matchId);
      
      // Save match state
      const match = await Match.findById(matchId);
      if (match && match.status === 'in_progress') {
        match.status = 'ended';
        match.endReason = reason;
        match.endedAt = Date.now();
        match.moves = matchState.moves;
        await match.save();
      }
    }
  };

  io.on('connection', (socket) => {
    console.log(`⚡ New socket connected: ${socket.id}`);
    
    let currentMatchId = null;

    // Join a battle room with spectator support
    socket.on('joinMatch', async ({ matchId, playerId, asSpectator = false }) => {
      try {
        if (!asSpectator) {
          const match = await validateMatchState(matchId, playerId);
          currentMatchId = matchId;
        }
        
        socket.join(matchId);
        
        // Initialize or update match state
        if (!activeMatches.has(matchId)) {
          activeMatches.set(matchId, {
            moves: [],
            spectators: new Set(),
            currentTurn: match.player1._id.toString(),
            startTime: Date.now()
          });
          
          // Set turn timer
          turnTimers.set(matchId, setTimeout(() => {
            io.to(matchId).emit('turnTimeout', { 
              playerId: activeMatches.get(matchId).currentTurn 
            });
          }, TURN_TIMEOUT));

          // Set inactive timer
          inactiveTimers.set(matchId, setTimeout(() => {
            cleanupMatch(matchId, 'inactivity');
            io.to(matchId).emit('matchEnded', { 
              reason: 'inactivity',
              timestamp: Date.now()
            });
          }, INACTIVE_TIMEOUT));
        }

        const matchState = activeMatches.get(matchId);
        if (asSpectator) {
          matchState.spectators.add(socket.id);
        }

        // Notify room of new participant
        io.to(matchId).emit('playerJoined', {
          playerId: asSpectator ? null : playerId,
          isSpectator: asSpectator,
          spectatorCount: matchState.spectators.size,
          timestamp: Date.now()
        });

      } catch (error) {
        socket.emit('error', { 
          message: error.message,
          timestamp: Date.now()
        });
      }
    });

    // Enhanced play card handling
    socket.on('playCard', async ({ matchId, playerId, card, target, damage }) => {
      try {
        const match = await validateMatchState(matchId, playerId);
        const matchState = activeMatches.get(matchId);

        if (matchState.currentTurn !== playerId) {
          throw new Error('Not your turn');
        }

        // Reset timers
        clearTimeout(turnTimers.get(matchId));
        clearTimeout(inactiveTimers.get(matchId));
        
        // Update match state
        matchState.moves.push({
          playerId,
          card,
          target,
          damage,
          timestamp: Date.now()
        });

        // Broadcast move
        io.to(matchId).emit('cardPlayed', {
          playerId,
          playerName: match[playerId === match.player1._id.toString() ? 'player1' : 'player2'].username,
          card,
          target,
          damage,
          moveNumber: matchState.moves.length,
          timestamp: Date.now()
        });

      } catch (error) {
        socket.emit('error', { 
          message: error.message,
          timestamp: Date.now()
        });
      }
    });

    // Handle disconnections
    socket.on('disconnect', async () => {
      console.log(`💨 Socket disconnected: ${socket.id}`);
      
      if (currentMatchId) {
        const matchState = activeMatches.get(currentMatchId);
        if (matchState?.spectators.has(socket.id)) {
          matchState.spectators.delete(socket.id);
          io.to(currentMatchId).emit('spectatorLeft', {
            count: matchState.spectators.size,
            timestamp: Date.now()
          });
        }
      }
    });

    // End turn
    socket.on('endTurn', async ({ matchId, playerId }) => {
      try {
        const match = await validateMatchState(matchId, playerId);
        const matchState = activeMatches.get(matchId);

        // Switch turns
        const nextPlayerId = playerId === match.player1.toString() 
          ? match.player2.toString() 
          : match.player1.toString();

        matchState.currentTurn = nextPlayerId;

        // Reset turn timer
        clearTimeout(turnTimers.get(matchId));
        turnTimers.set(matchId, setTimeout(() => {
          io.to(matchId).emit('turnTimeout', { playerId: nextPlayerId });
        }, TURN_TIMEOUT));

        io.to(matchId).emit('turnChanged', { 
          nextPlayerId,
          timestamp: Date.now() 
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Match chat
    socket.on('matchMessage', async ({ matchId, playerId, message }) => {
      try {
        await validateMatchState(matchId, playerId);
        
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
          throw new Error('Invalid message');
        }

        io.to(matchId).emit('matchMessage', {
          playerId,
          message: message.trim(),
          timestamp: Date.now()
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Match end
    socket.on('matchEnded', async ({ matchId, winnerId }) => {
      try {
        const match = await validateMatchState(matchId, winnerId);
        
        // Clean up timers and state
        clearTimeout(turnTimers.get(matchId));
        turnTimers.delete(matchId);
        const matchState = activeMatches.get(matchId);
        activeMatches.delete(matchId);

        // Save match data
        match.winner = winnerId;
        match.status = 'completed';
        match.completedAt = Date.now();
        match.moves = matchState.moves;
        await match.save();

        io.to(matchId).emit('matchEnded', {
          winnerId,
          stats: {
            duration: Date.now() - matchState.startTime,
            totalMoves: matchState.moves.length
          }
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
};


const { instrument } = require("@socket.io/admin-ui");

instrument(io, {
  auth: false // or implement proper auth
});

// Visit https://admin.socket.io in browser