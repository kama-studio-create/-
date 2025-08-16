const Match = require('../models/Match');

async function generateBracket(tournament) {
  const playerIds = [...tournament.players];
  const shuffled = playerIds.sort(() => 0.5 - Math.random());

  const matches = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    const player1 = shuffled[i];
    const player2 = shuffled[i + 1] || null; // Bye if odd number

    const match = new Match({
      player1,
      player2,
      round: 1,
      tournament: tournament._id,
      status: player2 ? 'pending' : 'completed',
      winner: player2 ? null : player1,
    });

    await match.save();
    matches.push(match._id);
  }

  tournament.matches = matches;
  tournament.status = 'in_progress';
  await tournament.save();

  return matches;
}

module.exports = generateBracket;
