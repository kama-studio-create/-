import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaderboardScreen = () => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/leaderboard/top');
        setTopPlayers(response.data.data || []);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Leaderboard Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <h2 className="text-xl mb-2">⚠️ Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">🏆</span> Top Players
        </h1>
        
        {topPlayers.length === 0 ? (
          <p className="text-gray-400 text-center">No players found</p>
        ) : (
          <div className="bg-gray-700 rounded-lg shadow-lg">
            {topPlayers.map((player, i) => (
              <div 
                key={player._id || i}
                className={`
                  flex items-center justify-between p-4
                  ${i !== topPlayers.length - 1 ? 'border-b border-gray-600' : ''}
                  ${i === 0 ? 'bg-yellow-500/10' : ''}
                  ${i === 1 ? 'bg-gray-400/10' : ''}
                  ${i === 2 ? 'bg-orange-700/10' : ''}
                `}
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-400 w-8">
                    {i + 1}.
                  </span>
                  <div>
                    <h3 className="text-white font-medium">{player.username}</h3>
                    <p className="text-sm text-gray-400">
                      Rating: {player.rating || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{player.wins} Wins</p>
                  <p className="text-sm text-gray-400">
                    {((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}% Win Rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
