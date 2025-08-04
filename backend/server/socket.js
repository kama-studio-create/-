// socket.js

module.exports = function (io) {
  const activeMatches = new Map(); // Optional: to store active match state

  io.on('connection', (socket) => {
    console.log(`⚡ New socket connected: ${socket.id}`);

    // Join a battle room (for player or spectator)
    socket.on('joinMatch', ({ matchId }) => {
      socket.join(matchId);
      console.log(`🔁 Socket ${socket.id} joined match ${matchId}`);
    });

    // Player plays a card during battle
    socket.on('playCard', ({ matchId, playerId, card, damage }) => {
      console.log(`🎮 ${playerId} played ${card.name} in match ${matchId}`);

      // Broadcast to both enemy and spectators
      io.to(matchId).emit('cardPlayed', {
        playerId,
        card,
        damage,
      });

      // Optional: update match state in memory
      if (!activeMatches.has(matchId)) {
        activeMatches.set(matchId, []);
      }
      activeMatches.get(matchId).push({ playerId, card, damage });
    });

    // Handle turn change
    socket.on('endTurn', ({ matchId, nextPlayerId }) => {
      io.to(matchId).emit('turnChanged', { nextPlayerId });
    });

    // Optionally handle chat in battle
    socket.on('matchMessage', ({ matchId, user, message }) => {
      io.to(matchId).emit('matchMessage', { user, message });
    });

    // Match ends
    socket.on('matchEnded', ({ matchId, winnerId }) => {
      console.log(`🏁 Match ${matchId} ended. Winner: ${winnerId}`);
      io.to(matchId).emit('matchEnded', { winnerId });

      // Clean up
      activeMatches.delete(matchId);
    });

    socket.on('disconnect', () => {
      console.log(`💨 Socket disconnected: ${socket.id}`);
    });
  });
};
