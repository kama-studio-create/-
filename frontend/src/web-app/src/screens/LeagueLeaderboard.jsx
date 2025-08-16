import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeagueLeaderboard = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    axios.get('/api/league/leaderboard').then(res => {
      setEntries(res.data);
    });
  }, []);

  const getRankReward = (rank) => {
    if (rank === 1) return 'VIP +100 PvP +2000 Gold';
    if (rank === 2) return 'VIP +75 PvP +1500 Gold';
    if (rank === 3) return 'VIP +50 PvP +1000 Gold';
    if (rank <= 9) return '30 PvP +750 Gold';
    if (rank <= 29) return '20 PvP +500 Gold';
    if (rank <= 100) return '10 PvP +250 Gold';
    return '';
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🏆 Reference League Leaderboard</h1>
      <table className="w-full text-left border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-yellow-300">
            <th className="p-2">Rank</th>
            <th className="p-2">Player</th>
            <th className="p-2">Total Points</th>
            <th className="p-2">Reward</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry._id} className="bg-gray-900 border-t border-gray-800">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{entry.user?.username || 'Unknown'}</td>
              <td className="p-2">{entry.totalPoints}</td>
              <td className="p-2 text-green-400">{getRankReward(index + 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeagueLeaderboard;
