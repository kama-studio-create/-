import React, { useState } from 'react';
import { User, Crown, Star, Clock, Settings } from 'lucide-react';

// Enhanced Profile Screen
const ProfileScreen = ({ user, onUpdateProfile }) => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    favoriteCard: user?.favoriteCard || ''
  });

  const stats = {
    gamesPlayed: 47,
    wins: 32,
    losses: 15,
    winStreak: 5,
    cardsOwned: 156,
    totalGold: user?.gold || 0,
    joinDate: 'March 2024'
  };

  const achievements = [
    { name: 'First Victory', icon: '🏆', description: 'Won your first battle' },
    { name: 'Card Collector', icon: '🃏', description: 'Own 100+ cards' },
    { name: 'Golden Warrior', icon: '💰', description: 'Earn 5000+ gold' },
    { name: 'Win Streak', icon: '🔥', description: 'Win 5 battles in a row' }
  ];

  const saveProfile = () => {
    onUpdateProfile?.(profile);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-4 rounded-full mr-6">
                <User size={40} className="text-white" />
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="text-3xl font-bold bg-transparent text-white border-b border-white/50 focus:outline-none focus:border-white"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  {user?.vipMonths > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-300 bg-purple-900/50">
                      <Crown size={14} className="inline mr-1" />
                      VIP Member
                    </span>
                  )}
                  <span className="text-gray-300">Joined {stats.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={saveProfile}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center"
                >
                  <Settings size={16} className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell other warriors about yourself..."
                className="w-full bg-white/10 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            ) : (
              <p className="text-gray-300">
                {profile.bio || "This warrior hasn't written a bio yet."}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">{stats.gamesPlayed}</p>
            <p className="text-sm text-gray-400">Games Played</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.wins}</p>
            <p className="text-sm text-gray-400">Wins</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {Math.round((stats.wins / stats.gamesPlayed) * 100)}%
            </p>
            <p className="text-sm text-gray-400">Win Rate</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.cardsOwned}</p>
            <p className="text-sm text-gray-400">Cards Owned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star size={24} className="mr-2 text-yellow-400" />
              Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-white">{achievement.name}</p>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Battle History */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock size={24} className="mr-2 text-blue-400" />
              Recent Battles
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-medium">Victory vs AI</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">+25 Rating</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-medium">Victory vs ShadowMage</p>
                    <p className="text-xs text-gray-400">5 hours ago</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">+32 Rating</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-medium">Defeat vs DragonSlayer</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold">-18 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};