import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Crown, Coins, Users, MessageCircle, Send, LogOut, Trophy } from 'lucide-react';

// Constants
const CLAN_CONSTANTS = {
  MIN_DONATION: 1,
  MAX_DONATION: 10000,
  MAX_MESSAGE_LENGTH: 200,
  MIN_MESSAGE_LENGTH: 1,
  MESSAGE_BOARD_HEIGHT: 'max-h-40',
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_MEMBERS_DISPLAY: 50
};

const CLAN_ROLES = {
  LEADER: 'leader',
  OFFICER: 'officer',
  MEMBER: 'member'
};

const ClanDetailsScreen = ({ userId, clanId, userGold = 0, onClanLeft, onError }) => {
  // State management
  const [clan, setClan] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [leavingClan, setLeavingClan] = useState(false);

  // Validation
  const isValidUserId = useMemo(() => userId && userId.length > 0, [userId]);
  const isValidClanId = useMemo(() => clanId && clanId.length > 0, [clanId]);
  const isValidDonation = useMemo(() => {
    const amount = Number(donation);
    return amount >= CLAN_CONSTANTS.MIN_DONATION && 
           amount <= CLAN_CONSTANTS.MAX_DONATION && 
           amount <= userGold;
  }, [donation, userGold]);

  // User role in clan
  const userRole = useMemo(() => {
    if (!clan || !userId) return null;
    if (clan.leader?._id === userId) return CLAN_ROLES.LEADER;
    // Add officer logic if needed
    return CLAN_ROLES.MEMBER;
  }, [clan, userId]);

  const isLeader = userRole === CLAN_ROLES.LEADER;

  // Fetch clan data
  const fetchClan = useCallback(async () => {
    if (!isValidClanId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/clans/${clanId}`);
      setClan(response.data);
      setMessage('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load clan details';
      setMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [clanId, isValidClanId, onError]);

  // Auto-refresh clan data
  useEffect(() => {
    fetchClan();
    
    const interval = setInterval(fetchClan, CLAN_CONSTANTS.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchClan]);

  // Leave clan
  const leaveClan = async () => {
    if (!isValidUserId || leavingClan) return;

    try {
      setLeavingClan(true);
      await axios.post('/api/clans/leave', { userId });
      setClan(null);
      setMessage('You left the clan.');
      onClanLeft?.();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error leaving clan';
      setMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLeavingClan(false);
    }
  };

  // Donate gold
  const handleDonation = async () => {
    if (!isValidDonation || submittingDonation || !isValidUserId) return;

    try {
      setSubmittingDonation(true);
      const amount = Number(donation);
      
      const response = await axios.post('/api/clans/donate', { 
        userId, 
        amount 
      });
      
      setMessage(response.data.message);
      setClan(prevClan => ({
        ...prevClan,
        treasury: response.data.clanTreasury
      }));
      setDonation('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error donating';
      setMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setSubmittingDonation(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const text = newMessage.trim();
    
    if (!text || 
        text.length < CLAN_CONSTANTS.MIN_MESSAGE_LENGTH || 
        text.length > CLAN_CONSTANTS.MAX_MESSAGE_LENGTH ||
        submittingMessage ||
        !isValidUserId) return;

    try {
      setSubmittingMessage(true);
      await axios.post('/api/clans/message', { userId, text });
      setNewMessage('');
      
      // Refresh clan data to show new message
      await fetchClan();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error sending message';
      setMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setSubmittingMessage(false);
    }
  };

  // Handle message input
  const handleMessageKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="ml-4">Loading clan details...</p>
      </div>
    );
  }

  // Render no clan state
  if (!clan) {
    return (
      <div className="text-white p-6 text-center">
        <Users size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg">{message || 'Not part of any clan.'}</p>
      </div>
    );
  }

  // Render clan details
  return (
    <div className="text-white p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Trophy className="mr-3 text-yellow-400" size={32} />
          {clan.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Crown size={20} className="mr-2 text-yellow-400" />
              <span className="font-semibold">Leader</span>
            </div>
            <p className="text-lg">{clan.leader?.username || 'Unknown'}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Coins size={20} className="mr-2 text-yellow-400" />
              <span className="font-semibold">Treasury</span>
            </div>
            <p className="text-lg font-bold">{clan.treasury?.toLocaleString() || 0} gold</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users size={20} className="mr-2 text-blue-400" />
              <span className="font-semibold">Members</span>
            </div>
            <p className="text-lg font-bold">{clan.members?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users size={24} className="mr-2 text-blue-400" />
          Members
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {clan.members?.slice(0, CLAN_CONSTANTS.MAX_MEMBERS_DISPLAY).map((member) => (
            <div key={member._id} className="flex items-center p-2 bg-gray-700 rounded">
              {member._id === clan.leader?._id && <Crown size={16} className="mr-2 text-yellow-400" />}
              <span>{member.username || 'Unknown'}</span>
            </div>
          ))}
        </div>
        
        {clan.members?.length > CLAN_CONSTANTS.MAX_MEMBERS_DISPLAY && (
          <p className="text-gray-400 text-sm mt-2">
            +{clan.members.length - CLAN_CONSTANTS.MAX_MEMBERS_DISPLAY} more members
          </p>
        )}
      </div>

      {/* Donation Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Coins size={24} className="mr-2 text-yellow-400" />
          Donate to Treasury
        </h3>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">
              Gold Amount (Your balance: {userGold?.toLocaleString() || 0})
            </label>
            <input
              type="number"
              min={CLAN_CONSTANTS.MIN_DONATION}
              max={Math.min(CLAN_CONSTANTS.MAX_DONATION, userGold)}
              value={donation}
              onChange={(e) => setDonation(e.target.value)}
              placeholder="Enter amount..."
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          
          <button
            onClick={handleDonation}
            disabled={!isValidDonation || submittingDonation}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isValidDonation && !submittingDonation
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submittingDonation ? 'Donating...' : 'Donate'}
          </button>
        </div>
        
        {donation && !isValidDonation && (
          <p className="text-red-400 text-sm mt-1">
            {Number(donation) > userGold 
              ? 'Insufficient gold' 
              : `Amount must be between ${CLAN_CONSTANTS.MIN_DONATION} and ${CLAN_CONSTANTS.MAX_DONATION}`}
          </p>
        )}
      </div>

      {/* Message Board */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageCircle size={24} className="mr-2 text-green-400" />
          Message Board
        </h3>

        <div className={`bg-gray-700 p-3 rounded ${CLAN_CONSTANTS.MESSAGE_BOARD_HEIGHT} overflow-y-auto mb-4`}>
          {clan.messages?.length > 0 ? (
            clan.messages.map((msg, i) => (
              <div key={i} className="mb-2 p-2 bg-gray-600 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-blue-400">{msg.user?.username || 'Unknown'}:</strong>
                  <span className="text-xs text-gray-400">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Now'}
                  </span>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No messages yet. Start the conversation!</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, CLAN_CONSTANTS.MAX_MESSAGE_LENGTH))}
            onKeyDown={handleMessageKeyDown}
            placeholder="Write a message..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-green-400 focus:outline-none"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || submittingMessage}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              newMessage.trim() && !submittingMessage
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submittingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-1">
          {newMessage.length}/{CLAN_CONSTANTS.MAX_MESSAGE_LENGTH} characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={leaveClan}
          disabled={leavingClan}
          className={`flex items-center px-4 py-2 rounded font-medium transition-colors ${
            leavingClan
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <LogOut size={16} className="mr-2" />
          {leavingClan ? 'Leaving...' : 'Leave Clan'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-900/50 text-red-400 border border-red-600' 
            : 'bg-green-900/50 text-green-400 border border-green-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

// Static methods
ClanDetailsScreen.defaultProps = {
  userGold: 0,
  onClanLeft: () => {},
  onError: () => {}
};

export default ClanDetailsScreen;