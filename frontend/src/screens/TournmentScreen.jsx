import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Loader2 } from 'lucide-react';

// Enhanced Tournament Screen
const TournamentScreen = ({ user, onJoinTournament }) => {
  const [tournaments, setTournaments] = useState([]);
  const [userTournament, setUserTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading tournament data
    setTimeout(() => {
      setTournaments([
        {
          id: 1,
          name: 'Weekly Championship',
          status: 'registering',
          participants: 32,
          maxParticipants: 64,
          prizePool: 5000,
          entryFee: 100,
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Beginner Tournament',
          status: 'in_progress',
          participants: 16,
          maxParticipants: 16,
          prizePool: 1000,
          entryFee: 25,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const joinTournament = (tournamentId) => {
    onJoinTournament?.(tournamentId);
    setUserTournament(tournamentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Tournaments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Trophy size={32} className="mr-3 text-yellow-400" />
            Tournaments
          </h1>
          <p className="text-gray-300">Compete for glory and rewards</p>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tournament.status === 'registering' ? 'bg-green-600/20 text-green-400' :
                    tournament.status === 'in_progress' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {tournament.status === 'registering' ? '📝 Registering' :
                     tournament.status === 'in_progress' ? '⚔️ In Progress' : '✅ Completed'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-lg">{tournament.prizePool}</p>
                  <p className="text-xs text-gray-400">Prize Pool</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Participants:</span>
                  <span className="text-white">{tournament.participants}/{tournament.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="text-yellow-400 flex items-center">
                    <Coins size={16} className="mr-1" />
                    {tournament.entryFee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="text-white">
                    {new Date(tournament.startTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                />
              </div>

              {tournament.status === 'registering' ? (
                <button
                  onClick={() => joinTournament(tournament.id)}
                  disabled={user?.gold < tournament.entryFee || userTournament === tournament.id}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    user?.gold >= tournament.entryFee && userTournament !== tournament.id
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {userTournament === tournament.id ? '✅ Registered' : 
                   user?.gold < tournament.entryFee ? 'Insufficient Gold' : 'Join Tournament'}
                </button>
              ) : tournament.status === 'in_progress' ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                  👁️ Watch Live
                </button>
              ) : (
                <button className="w-full bg-gray-600 text-gray-400 py-3 rounded-lg font-medium cursor-not-allowed">
                  Tournament Ended
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tournament Bracket Preview */}
        <div className="mt-8 bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Tournament Bracket</h3>
          <div className="text-center text-gray-400 py-8">
            <Trophy size={48} className="mx-auto mb-4" />
            <p>Join a tournament to see the bracket</p>
          </div>
        </div>
      </div>
    </div>
  );
};