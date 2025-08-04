import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaderboardScreen = () => {
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    axios.get('/api/leaderboard/top').then(res => {
      setTopPlayers(res.data);
    });
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">🏆 Top Players</h1>
      <ul>
        {topPlayers.map((player, i) => (
          <li key={i} className="mb-2">
            {i + 1}. {player.username} — {player.wins} Wins
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardScreen;

