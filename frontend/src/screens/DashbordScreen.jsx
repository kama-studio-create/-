
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, Coins, Ticket, Crown, Trophy, Sword, Shield, Users, 
  TrendingUp, Calendar, Gift, Play, Settings, BarChart3, Zap, 
  Star, Clock, Target, Heart, Plus, AlertCircle, Loader2,
  MessageCircle, Send, LogOut, ShoppingCart, Package
} from 'lucide-react';

const DashboardScreen = ({ user, onNavigate, onError, onSuccess }) => {
  const [stats, setStats] = useState({ wins: 0, losses: 0, winStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  const userLevel = useMemo(() => {
    const gold = user?.gold || 0;
    if (gold < 1000) return { label: 'Newbie', color: 'text-gray-400', progress: gold / 1000 * 100 };
    if (gold < 5000) return { label: 'Warrior', color: 'text-green-400', progress: (gold - 1000) / 4000 * 100 };
    if (gold < 15000) return { label: 'Champion', color: 'text-blue-400', progress: (gold - 5000) / 10000 * 100 };
    return { label: 'Legend', color: 'text-purple-400', progress: 100 };
  }, [user?.gold]);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({ wins: 12, losses: 3, winStreak: 5 });
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions = [
    { id: 'battle', label: 'Battle', icon: Sword, color: 'bg-red-600/20 hover:bg-red-600/30', iconColor: 'text-red-400' },
    { id: 'deck', label: 'Deck', icon: Shield, color: 'bg-blue-600/20 hover:bg-blue-600/30', iconColor: 'text-blue-400' },
    { id: 'marketplace', label: 'Market', icon: ShoppingCart, color: 'bg-green-600/20 hover:bg-green-600/30', iconColor: 'text-green-400' },
    { id: 'clan', label: 'Clan', icon: Users, color: 'bg-purple-600/20 hover:bg-purple-600/30', iconColor: 'text-purple-400' },
    { id: 'tournament', label: 'Tournament', icon: Trophy, color: 'bg-yellow-600/20 hover:bg-yellow-600/30', iconColor: 'text-yellow-400' },
    { id: 'leaderboard', label: 'Rankings', icon: BarChart3, color: 'bg-orange-600/20 hover:bg-orange-600/30', iconColor: 'text-orange-400' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="bg-white/20 p-4 rounded-full mr-6">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.username || 'Warrior'}!
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${userLevel.color} bg-black/30`}>
                    {userLevel.label}
                  </span>
                  {user?.vipMonths > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-300 bg-purple-900/50">
                      <Crown size={14} className="inline mr-1" />
                      VIP
                    </span>
                  )}
                </div>
                
                {/* Level Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Progress to next level</span>
                    <span>{Math.round(userLevel.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${userLevel.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Reward Button */}
            <div className="flex-shrink-0">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                <Gift size={20} className="mr-2" />
                Daily Reward
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Gold</p>
                <p className="text-2xl font-bold text-yellow-400">{user?.gold?.toLocaleString() || 0}</p>
              </div>
              <Coins size={32} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">PvP Tickets</p>
                <p className="text-2xl font-bold text-green-400">{user?.pvpTickets || 0}</p>
              </div>
              <Ticket size={32} className="text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats ? Math.round((stats.wins / (stats.wins + stats.losses || 1)) * 100) : 0}%
                </p>
              </div>
              <TrendingUp size={32} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Streak</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.winStreak || 0}</p>
              </div>
              <Zap size={32} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Target size={24} className="mr-2 text-blue-400" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate?.(action.id)}
                  className={`flex flex-col items-center p-4 ${action.color} rounded-lg transition-colors group`}
                >
                  <Icon size={24} className={`${action.iconColor} group-hover:scale-110 transition-transform mb-2`} />
                  <span className="text-sm font-medium text-white">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Achievements */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star size={24} className="mr-2 text-yellow-400" />
              Recent Achievements
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                <Trophy size={20} className="mr-3 text-green-400" />
                <div>
                  <p className="font-medium text-white">First Victory</p>
                  <p className="text-sm text-gray-400">Won your first battle</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                <Zap size={20} className="mr-3 text-yellow-400" />
                <div>
                  <p className="font-medium text-white">Hot Streak</p>
                  <p className="text-sm text-gray-400">Won 5 battles in a row</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                <Coins size={20} className="mr-3 text-yellow-400" />
                <div>
                  <p className="font-medium text-white">Golden Warrior</p>
                  <p className="text-sm text-gray-400">Accumulated 5,000+ gold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock size={24} className="mr-2 text-blue-400" />
              Recent Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-white text-sm">Won battle against AI</span>
                </div>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-white text-sm">Updated deck composition</span>
                </div>
                <span className="text-xs text-gray-400">15 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-white text-sm">Claimed daily reward</span>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
