import React, { useState, useEffect } from 'react';

const DailyRewardButton = ({ user, onRewardClaimed }) => {
  const [claimed, setClaimed] = useState(false);
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(null);

  useEffect(() => {
    checkRewardStatus();
  }, [user]);

  const checkRewardStatus = async () => {
    if (!user?.telegramId) return;

    try {
      const res = await fetch(`/api/daily/status/${user.telegramId}`);
      const data = await res.json();
      setClaimed(data.claimed);
      setTimeUntilNext(data.timeUntilNext);
    } catch (err) {
      console.error('Failed to check reward status:', err);
    }
  };

  const claimReward = async () => {
    if (!user?.telegramId || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.telegramId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim reward');
      }
      
      setReward(data.reward);
      setClaimed(true);
      setTimeUntilNext(data.timeUntilNext);
      
      // Notify parent component to update user data
      if (onRewardClaimed) {
        onRewardClaimed(data.reward);
      }
      
    } catch (err) {
      const message = err.message || "Already claimed today or error occurred.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeUntilNext = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return null;
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (claimed && reward) {
    return (
      <div className="bg-green-800 border border-green-600 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-green-400 font-semibold">Daily Reward Claimed!</p>
              <p className="text-sm text-green-300">+{reward.gold} Gold, +{reward.tickets} Tickets</p>
            </div>
          </div>
          {timeUntilNext && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Next reward in:</p>
              <p className="text-sm font-mono">{formatTimeUntilNext(timeUntilNext)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (claimed && !reward) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl opacity-50">🎁</span>
            <div>
              <p className="text-gray-400">Daily reward already claimed</p>
              <p className="text-sm text-gray-500">Come back tomorrow!</p>
            </div>
          </div>
          {timeUntilNext && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Next reward in:</p>
              <p className="text-sm font-mono">{formatTimeUntilNext(timeUntilNext)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl animate-bounce">🎁</span>
          <div>
            <p className="text-yellow-400 font-semibold">Daily Reward Available!</p>
            <p className="text-sm text-yellow-300">Claim your free gold and tickets</p>
          </div>
        </div>
        <button 
          onClick={claimReward}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            loading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105'
          }`}
        >
          {loading ? 'Claiming...' : 'Claim Reward'}
        </button>
      </div>
    </div>
  );
};

const HomeScreen = ({ user, onUserUpdate }) => {
  const [userStats, setUserStats] = useState(user);

  const handleRewardClaimed = (reward) => {
    // Update local user stats
    setUserStats(prev => ({
      ...prev,
      gold: prev.gold + reward.gold,
      pvpTickets: prev.pvpTickets + reward.tickets
    }));

    // Notify parent component
    if (onUserUpdate) {
      onUserUpdate({
        ...userStats,
        gold: userStats.gold + reward.gold,
        pvpTickets: userStats.pvpTickets + reward.tickets
      });
    }
  };

  useEffect(() => {
    setUserStats(user);
  }, [user]);

  if (!userStats) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userStats.displayName || userStats.username || 'Player'}!
        </h1>
        
        {/* User Stats */}
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">💰</span>
            <span>{userStats.gold?.toLocaleString() || 0} Gold</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-blue-400">🎫</span>
            <span>{userStats.pvpTickets || 0} PvP Tickets</span>
          </div>
          {userStats.isVIP && (
            <div className="flex items-center space-x-1">
              <span className="text-purple-400">👑</span>
              <span>VIP</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Reward */}
      <DailyRewardButton 
        user={userStats} 
        onRewardClaimed={handleRewardClaimed}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Collection</h3>
          <p className="text-2xl font-bold text-blue-400">{userStats.cards?.length || 0}</p>
          <p className="text-sm text-gray-400">Cards Owned</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Deck</h3>
          <p className="text-2xl font-bold text-green-400">{userStats.deck?.length || 0}/30</p>
          <p className="text-sm text-gray-400">Cards in Deck</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors">
          ⚔️ Enter Battle Arena
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            🃏 Manage Deck
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            🛒 Card Shop
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            🏆 Leaderboard
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            👥 Clan
          </button>
        </div>
      </div>
    </div>
  );
};

export { DailyRewardButton };
export default HomeScreen;