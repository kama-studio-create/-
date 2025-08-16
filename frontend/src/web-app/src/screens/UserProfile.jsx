import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Coins, Ticket, Crown, Gift, Trophy } from 'lucide-react';

const UserProfile = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/profile/${userId}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-white text-center">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">👤 Profile</h1>
            <p className="text-purple-200">Mythic Warrior Stats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User size={20} className="mr-2 text-blue-300" />
              <span className="font-semibold">Username</span>
            </div>
            <p className="text-xl">{data.username || 'Anonymous Warrior'}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Coins size={20} className="mr-2 text-yellow-400" />
              <span className="font-semibold">Gold</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">{data.gold?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Ticket size={20} className="mr-2 text-green-400" />
              <span className="font-semibold">PvP Tickets</span>
            </div>
            <p className="text-xl font-bold text-green-400">{data.pvpTickets || 0}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Crown size={20} className="mr-2 text-purple-400" />
              <span className="font-semibold">VIP Status</span>
            </div>
            <p className="text-xl font-bold text-purple-400">
              {data.vipMonths > 0 ? `${data.vipMonths} months` : 'None'}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Trophy size={20} className="mr-2 text-orange-400" />
              <span className="font-semibold">Cards Owned</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{data.cardCount || 0}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Gift size={20} className="mr-2 text-pink-400" />
              <span className="font-semibold">Referral Points</span>
            </div>
            <p className="text-xl font-bold text-pink-400">{data.referralPoints || 0}</p>
          </div>
        </div>

        {/* Additional Stats */}
        {data.stats && (
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Trophy size={24} className="mr-2 text-yellow-400" />
              Battle Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-green-400 font-bold text-lg">{data.stats.wins || 0}</p>
                <p className="text-gray-300">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 font-bold text-lg">{data.stats.losses || 0}</p>
                <p className="text-gray-300">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 font-bold text-lg">{data.stats.tournaments || 0}</p>
                <p className="text-gray-300">Tournaments</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 font-bold text-lg">
                  {data.stats.wins > 0 ? Math.round((data.stats.wins / (data.stats.wins + data.stats.losses)) * 100) : 0}%
                </p>
                <p className="text-gray-300">Win Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="mt-6 text-sm text-gray-300 text-center">
          <p>Member since: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown'}</p>
          {data.lastActive && (
            <p>Last active: {new Date(data.lastActive).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;