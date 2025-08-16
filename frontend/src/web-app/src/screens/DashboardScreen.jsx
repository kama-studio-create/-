import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Coins, 
  Ticket, 
  Crown, 
  Trophy, 
  Sword, 
  Shield, 
  Users, 
  TrendingUp,
  Calendar,
  Gift,
  Play,
  Settings,
  BarChart3,
  Zap,
  Star,
  Clock,
  Target
} from 'lucide-react';
import DailyRewardButton from '../components/DailyRewardButton';

// Constants
const DASHBOARD_CONSTANTS = {
  REFRESH_INTERVAL: 60000, // 1 minute
  STATS_REFRESH_INTERVAL: 300000, // 5 minutes
  QUICK_ACTIONS: {
    BATTLE: 'battle',
    DECK: 'deck',
    MARKETPLACE: 'marketplace',
    CLAN: 'clan',
    TOURNAMENT: 'tournament',
    LEADERBOARD: 'leaderboard'
  },
  USER_LEVELS: {
    NEWBIE: { min: 0, max: 999, label: 'Newbie', color: 'text-gray-400' },
    WARRIOR: { min: 1000, max: 4999, label: 'Warrior', color: 'text-green-400' },
    CHAMPION: { min: 5000, max: 9999, label: 'Champion', color: 'text-blue-400' },
    LEGEND: { min: 10000, max: 24999, label: 'Legend', color: 'text-purple-400' },
    MYTHIC: { min: 25000, max: Infinity, label: 'Mythic', color: 'text-yellow-400' }
  },
  ACHIEVEMENT_THRESHOLDS: {
    FIRST_WIN: 1,
    WIN_STREAK_5: 5,
    WIN_STREAK_10: 10,
    RICH_PLAYER: 5000,
    CARD_COLLECTOR: 50,
    CLAN_MEMBER: 1
  }
};

const DashboardScreen = ({ 
  user, 
  onError,
  onSuccess,
  onNavigate 
}) => {
  // State management
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  
  const navigate = useNavigate();

  // User validation and computed values
  const isValidUser = useMemo(() => {
    return user && user._id && user.username;
  }, [user]);

  const userLevel = useMemo(() => {
    if (!user?.gold) return DASHBOARD_CONSTANTS.USER_LEVELS.NEWBIE;
    
    const gold = user.gold;
    return Object.values(DASHBOARD_CONSTANTS.USER_LEVELS).find(
      level => gold >= level.min && gold <= level.max
    ) || DASHBOARD_CONSTANTS.USER_LEVELS.MYTHIC;
  }, [user?.gold]);

  const progressToNextLevel = useMemo(() => {
    if (!user?.gold || userLevel === DASHBOARD_CONSTANTS.USER_LEVELS.MYTHIC) return 100;
    
    const currentGold = user.gold;
    const currentMin = userLevel.min;
    const nextMax = userLevel.max + 1;
    
    return Math.round(((currentGold - currentMin) / (nextMax - currentMin)) * 100);
  }, [user?.gold, userLevel]);

  // Fetch user stats and activity
  const fetchDashboardData = useCallback(async () => {
    if (!isValidUser) return;

    try {
      setLoading(true);
      
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`/api/users/stats/${user._id}`),
        axios.get(`/api/users/activity/${user._id}`)
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data?.activities || []);
      setDailyStreak(activityRes.data?.dailyStreak || 0);
      
      // Calculate achievements
      calculateAchievements(statsRes.data);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use fallback data if API fails
      setStats({
        wins: 0,
        losses: 0,
        winStreak: 0,
        battlesPlayed: 0,
        tournamentsWon: 0
      });
    } finally {
      setLoading(false);
    }
  }, [isValidUser, user?._id]);

  // Calculate user achievements
  const calculateAchievements = useCallback((userStats) => {
    const newAchievements = [];
    
    if (userStats?.wins >= DASHBOARD_CONSTANTS.ACHIEVEMENT_THRESHOLDS.FIRST_WIN) {
      newAchievements.push({
        id: 'first_win',
        title: 'First Victory',
        description: 'Won your first battle',
        icon: Trophy,
        color: 'text-green-400'
      });
    }

    if (userStats?.winStreak >= DASHBOARD_CONSTANTS.ACHIEVEMENT_THRESHOLDS.WIN_STREAK_5) {
      newAchievements.push({
        id: 'win_streak_5',
        title: 'Hot Streak',
        description: 'Won 5 battles in a row',
        icon: Zap,
        color: 'text-yellow-400'
      });
    }

    if (user?.gold >= DASHBOARD_CONSTANTS.ACHIEVEMENT_THRESHOLDS.RICH_PLAYER) {
      newAchievements.push({
        id: 'rich_player',
        title: 'Golden Warrior',
        description: 'Accumulated 5,000+ gold',
        icon: Coins,
        color: 'text-yellow-400'
      });
    }

    if (user?.clanId) {
      newAchievements.push({
        id: 'clan_member',
        title: 'Team Player',
        description: 'Joined a clan',
        icon: Users,
        color: 'text-blue-400'
      });
    }

    setAchievements(newAchievements);
  }, [user?.gold, user?.clanId]);

  // Auto-refresh dashboard data
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, DASHBOARD_CONSTANTS.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Quick action handlers
  const handleQuickAction = useCallback((action) => {
    const routes = {
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.BATTLE]: '/battle',
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.DECK]: '/deck',
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.MARKETPLACE]: '/marketplace',
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.CLAN]: '/clan',
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.TOURNAMENT]: '/tournament',
      [DASHBOARD_CONSTANTS.QUICK_ACTIONS.LEADERBOARD]: '/leaderboard'
    };

    const route = routes[action];
    if (route) {
      navigate(route);
      onNavigate?.(route);
    }
  }, [navigate, onNavigate]);

  // Handle daily reward claimed
  const handleRewardClaimed = useCallback((reward) => {
    setDailyStreak(prev => prev + 1);
    onSuccess?.(`Claimed daily reward: ${reward} gold!`);
  }, [onSuccess]);

  // Render loading state
  if (!isValidUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-gray-300">Please wait while we load your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="bg-white/20 p-4 rounded-full mr-6">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {user.username}!
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${userLevel.color} bg-black/30`}>
                    {userLevel.label}
                  </span>
                  {user.vipMonths > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-300 bg-purple-900/50">
                      <Crown size={14} className="inline mr-1" />
                      VIP
                    </span>
                  )}
                  {dailyStreak > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-orange-300 bg-orange-900/50">
                      <Calendar size={14} className="inline mr-1" />
                      {dailyStreak} day streak
                    </span>
                  )}
                </div>
                
                {/* Level Progress Bar */}
                {userLevel !== DASHBOARD_CONSTANTS.USER_LEVELS.MYTHIC && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Progress to next level</span>
                      <span>{progressToNextLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressToNextLevel}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Reward */}
            <div className="flex-shrink-0">
              <DailyRewardButton 
                userId={user._id} 
                onRewardClaimed={handleRewardClaimed}
                onError={onError}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Gold</p>
                <p className="text-2xl font-bold text-yellow-400">{user.gold?.toLocaleString() || 0}</p>
              </div>
              <Coins size={32} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">PvP Tickets</p>
                <p className="text-2xl font-bold text-green-400">{user.pvpTickets || 0}</p>
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
                <p className="text-sm text-gray-400">Current Streak</p>
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
            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.BATTLE)}
              className="flex flex-col items-center p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors group"
            >
              <Sword size={24} className="text-red-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Battle</span>
            </button>

            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.DECK)}
              className="flex flex-col items-center p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors group"
            >
              <Shield size={24} className="text-blue-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Deck</span>
            </button>

            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.MARKETPLACE)}
              className="flex flex-col items-center p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors group"
            >
              <Coins size={24} className="text-green-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Market</span>
            </button>

            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.CLAN)}
              className="flex flex-col items-center p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors group"
            >
              <Users size={24} className="text-purple-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Clan</span>
            </button>

            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.TOURNAMENT)}
              className="flex flex-col items-center p-4 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors group"
            >
              <Trophy size={24} className="text-yellow-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Tournament</span>
            </button>

            <button
              onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.LEADERBOARD)}
              className="flex flex-col items-center p-4 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors group"
            >
              <BarChart3 size={24} className="text-orange-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-medium text-white">Rankings</span>
            </button>
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
            
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                      <IconComponent size={20} className={`mr-3 ${achievement.color}`} />
                      <div>
                        <p className="font-medium text-white">{achievement.title}</p>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-400">No achievements yet</p>
                <p className="text-sm text-gray-500">Start playing to unlock achievements!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock size={24} className="mr-2 text-blue-400" />
              Recent Activity
            </h3>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-white text-sm">{activity.description}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500">Start playing to see your activity here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready for Battle?</h3>
            <p className="text-gray-300 mb-6">
              Check your cards, battle opponents, and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.BATTLE)}
                className="flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Play size={20} className="mr-2" />
                Start Battle
              </button>
              <button
                onClick={() => handleQuickAction(DASHBOARD_CONSTANTS.QUICK_ACTIONS.DECK)}
                className="flex items-center justify-center px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <Settings size={20} className="mr-2" />
                Manage Deck
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default props
DashboardScreen.defaultProps = {
  onError: () => {},
  onSuccess: () => {},
  onNavigate: () => {}
};

export default DashboardScreen;