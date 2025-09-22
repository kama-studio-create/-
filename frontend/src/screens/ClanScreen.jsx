
import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Send, LogOut, Plus, Loader2 } from 'lucide-react';

// Enhanced Clan Screen
const ClanScreen = ({ user, onJoinClan, onLeaveClan }) => {
  const [clans, setClans] = useState([]);
  const [userClan, setUserClan] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading clan data
    setTimeout(() => {
      setClans([
        {
          id: 1,
          name: 'Dragon Warriors',
          members: 45,
          maxMembers: 50,
          level: 8,
          trophies: 2500,
          description: 'Elite warriors seeking glory'
        },
        {
          id: 2,
          name: 'Shadow Legends',
          members: 38,
          maxMembers: 50,
          level: 6,
          trophies: 1800,
          description: 'Masters of stealth and strategy'
        }
      ]);
      
      if (user?.clanId) {
        setUserClan({
          id: user.clanId,
          name: 'Mystic Order',
          members: 42,
          treasury: 15000,
          yourRank: 'Member',
          messages: [
            { user: 'ClanLeader', message: 'Welcome new members!', time: '2 hours ago' },
            { user: 'WarriorX', message: 'Ready for clan war!', time: '4 hours ago' }
          ]
        });
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  const joinClan = (clanId) => {
    onJoinClan?.(clanId);
    setMessage('Successfully joined clan!');
  };

  const leaveClan = () => {
    onLeaveClan?.();
    setUserClan(null);
    setMessage('Left clan successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Clans...</h2>
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
            <Users size={32} className="mr-3 text-purple-400" />
            Clan System
          </h1>
          <p className="text-gray-300">Join forces with other warriors</p>
        </div>

        {message && (
          <div className="bg-green-600/20 border border-green-600 text-green-300 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {userClan ? (
          /* User's Clan */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{userClan.name}</h2>
                  <p className="text-gray-300">Your Rank: {userClan.yourRank}</p>
                </div>
                <button
                  onClick={leaveClan}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Leave
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{userClan.members}</p>
                  <p className="text-sm text-gray-400">Members</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{userClan.treasury?.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Treasury</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2">Donate to Treasury</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount..."
                    className="flex-1 p-2 bg-gray-700 text-white rounded"
                  />
                  <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-medium transition-colors">
                    Donate
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Clan Chat</h3>
                <MessageCircle size={20} className="text-blue-400" />
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 h-48 overflow-y-auto mb-4">
                {userClan.messages.map((msg, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-400 font-medium">{msg.user}</span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-700 text-white rounded"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Available Clans */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Available Clans</h2>
              <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center">
                <Plus size={20} className="mr-2" />
                Create Clan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clans.map((clan) => (
                <div key={clan.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{clan.name}</h3>
                      <p className="text-sm text-gray-400">Level {clan.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{clan.trophies}</p>
                      <p className="text-xs text-gray-400">Trophies</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{clan.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">Members</span>
                    <span className="text-white">{clan.members}/{clan.maxMembers}</span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(clan.members / clan.maxMembers) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => joinClan(clan.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Join Clan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};