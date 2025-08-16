const Match = require('../models/Match');
const config = require('../config');

class MatchHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.matchId = null;
    this.userId = null;
  }

  async joinMatch(matchId) {
    try {
      const match = await Match.findById(matchId)
        .populate('player1', 'username')
        .populate('player2', 'username');

      if (!match) {
        throw new Error('Match not found');
      }

      this.matchId = matchId;
      this.socket.join(`match:${matchId}`);
      
      return { success: true, match };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async makeMove(moveData) {
    try {
      if (!this.matchId) {
        throw new Error('Not in a match');
      }

      const match = await Match.findById(this.matchId);
      if (!match || match.status !== 'in_progress') {
        throw new Error('Invalid match state');
      }

      // Add move validation logic here
      
      this.io.to(`match:${this.matchId}`).emit('game:move', {
        player: this.userId,
        move: moveData
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  leaveMatch() {
    if (this.matchId) {
      this.socket.leave(`match:${this.matchId}`);
      this.matchId = null;
    }
  }
}

module.exports = MatchHandler;
