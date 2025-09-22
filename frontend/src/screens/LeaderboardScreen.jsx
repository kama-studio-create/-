import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';

// Enhanced Leaderboard Screen
const LeaderboardScreen = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading leaderboard data
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, username: 'DragonSlayer', rating: 2850, wins: 156, losses: 23, clan: 'Dragon Warriors' },
        { rank: 2, username: 'ShadowMaster', rating: 2720, wins: 142, losses: 31, clan: 'Shadow Legends' },
        { rank: 3, username: 'FireWizard', rating: 2680, wins: 138, losses: 28, clan: 'Mystic Order' },
        { rank: 4, username: 'IceQueen', rating: 2610, wins: 134, losses: 35, clan: 'Frost Guild' },
        { rank: 5, username: 'StormKnight', rating: 2580, wins: 129, losses: 38, clan: 'Thunder Clan' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Leaderboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <BarChart3 size={32} className="mr-3 text-orange-400" />
            Leaderboard
          </h1>
          <p className="text-gray-300">Top warriors of Mythic Warriors</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20">
            <h2 className="text-xl font-bold text-white">Global Rankings</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboard.map((player, index) => (
              <div 
                key={player.rank}
                className={`p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors ${
                  index === 0 ? 'bg-yellow-500/10' :
                  index === 1 ? 'bg-gray-400/10' :
                  index === 2 ? 'bg-orange-600/10' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-white font-bold">#{player.rank}</span>}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">{player.username}</h3>
                    <p className="text-sm text-gray-400">{player.clan}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-lg font-bold text-blue-400">{player.rating}</p>
                    <p className="text-xs text-gray-400">Rating</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-400">{player.wins}W</p>
                    <p className="text-sm text-red-400">{player.losses}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-400">
                      {Math.round((player.wins / (player.wins + player.losses)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">Win Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Rank */}
        <div className="mt-8 bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Ranking</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-white">{user?.username || 'Your Name'}</p>
              <p className="text-gray-300">Rank #47</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">1850</p>
              <p className="text-sm text-gray-400">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
