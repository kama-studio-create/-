import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, Plus, AlertCircle, Loader2 } from 'lucide-react';
import ClanDetailsScreen from './ClanDetailsScreen';
import ClanListScreen from './ClanListScreen';
import CreateClanForm from '../components/CreateClanForm';

// Constants
const CLAN_SCREEN_CONSTANTS = {
  MODES: {
    LOADING: 'loading',
    CLAN_DETAILS: 'clan_details',
    CLAN_LIST: 'clan_list',
    CREATE_CLAN: 'create_clan',
    ERROR: 'error'
  },
  REFRESH_INTERVAL: 30000, // 30 seconds
  MIN_USERNAME_LENGTH: 3,
  TRANSITION_DELAY: 200
};

const ClanScreen = ({ 
  user, 
  onUserUpdate, 
  onError,
  onSuccess 
}) => {
  // State management
  const [currentMode, setCurrentMode] = useState(CLAN_SCREEN_CONSTANTS.MODES.LOADING);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Validation and computed values
  const isValidUser = useMemo(() => {
    return user && 
           user._id && 
           user.username && 
           user.username.length >= CLAN_SCREEN_CONSTANTS.MIN_USERNAME_LENGTH;
  }, [user]);

  const userClanId = user?.clanId;
  const hasActiveClan = Boolean(userClanId);

  // Determine current mode based on user state and URL
  useEffect(() => {
    if (!user) {
      setCurrentMode(CLAN_SCREEN_CONSTANTS.MODES.LOADING);
      return;
    }

    if (!isValidUser) {
      setCurrentMode(CLAN_SCREEN_CONSTANTS.MODES.ERROR);
      setError('Invalid user data. Please refresh or log in again.');
      return;
    }

    // Check URL params for specific modes
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'create') {
      setCurrentMode(CLAN_SCREEN_CONSTANTS.MODES.CREATE_CLAN);
    } else if (hasActiveClan) {
      setCurrentMode(CLAN_SCREEN_CONSTANTS.MODES.CLAN_DETAILS);
    } else {
      setCurrentMode(CLAN_SCREEN_CONSTANTS.MODES.CLAN_LIST);
    }
  }, [user, isValidUser, hasActiveClan, location.search]);

  // Handle mode transitions with smooth animations
  const handleModeTransition = useCallback((newMode, delay = CLAN_SCREEN_CONSTANTS.TRANSITION_DELAY) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentMode(newMode);
      setIsTransitioning(false);
    }, delay);
  }, []);

  // Handle clan creation success
  const handleClanCreated = useCallback((newClanId, clanName) => {
    setSuccessMessage(`Successfully created clan "${clanName}"!`);
    
    // Update user with new clan ID
    const updatedUser = { ...user, clanId: newClanId };
    onUserUpdate?.(updatedUser);
    
    // Transition to clan details
    setTimeout(() => {
      handleModeTransition(CLAN_SCREEN_CONSTANTS.MODES.CLAN_DETAILS);
    }, 1500);
    
    onSuccess?.(`Created clan: ${clanName}`);
  }, [user, onUserUpdate, onSuccess, handleModeTransition]);

  // Handle clan joining success
  const handleClanJoined = useCallback((clanId, clanName) => {
    setSuccessMessage(`Successfully joined clan "${clanName}"!`);
    
    // Update user with new clan ID
    const updatedUser = { ...user, clanId };
    onUserUpdate?.(updatedUser);
    
    // Transition to clan details
    setTimeout(() => {
      handleModeTransition(CLAN_SCREEN_CONSTANTS.MODES.CLAN_DETAILS);
    }, 1500);
    
    onSuccess?.(`Joined clan: ${clanName}`);
  }, [user, onUserUpdate, onSuccess, handleModeTransition]);

  // Handle clan leaving success
  const handleClanLeft = useCallback(() => {
    setSuccessMessage('Successfully left the clan.');
    
    // Update user by removing clan ID
    const updatedUser = { ...user, clanId: null };
    onUserUpdate?.(updatedUser);
    
    // Transition to clan list
    setTimeout(() => {
      handleModeTransition(CLAN_SCREEN_CONSTANTS.MODES.CLAN_LIST);
    }, 1500);
    
    onSuccess?.('Left clan successfully');
  }, [user, onUserUpdate, onSuccess, handleModeTransition]);

  // Handle navigation to create clan
  const handleCreateClan = useCallback(() => {
    navigate('/clan?mode=create');
  }, [navigate]);

  // Handle navigation back to clan list
  const handleBackToClanList = useCallback(() => {
    navigate('/clan');
  }, [navigate]);

  // Handle errors
  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    onError?.(errorMessage);
    
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, [onError]);

  // Handle success messages
  const handleSuccess = useCallback((message) => {
    setSuccessMessage(message);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  // Render loading state
  if (currentMode === CLAN_SCREEN_CONSTANTS.MODES.LOADING || isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Clan Information</h2>
          <p className="text-gray-300">Please wait while we fetch your clan data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (currentMode === CLAN_SCREEN_CONSTANTS.MODES.ERROR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Unable to Load Clan Screen</h2>
          <p className="text-red-300 mb-6">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Navigation */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="text-blue-400" size={28} />
              <div>
                <h1 className="text-xl font-bold text-white">Clan Management</h1>
                <p className="text-sm text-gray-300">
                  {hasActiveClan 
                    ? 'Managing your clan' 
                    : 'Find or create a clan'
                  }
                </p>
              </div>
            </div>

            {/* Navigation buttons based on current mode */}
            <div className="flex items-center space-x-2">
              {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CLAN_DETAILS && (
                <button
                  onClick={handleBackToClanList}
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Users size={16} className="mr-2" />
                  Browse Clans
                </button>
              )}

              {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CLAN_LIST && (
                <button
                  onClick={handleCreateClan}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Create Clan
                </button>
              )}

              {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CREATE_CLAN && (
                <button
                  onClick={handleBackToClanList}
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Users size={16} className="mr-2" />
                  Back to List
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(error || successMessage) && (
        <div className="container mx-auto px-4 py-4">
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/50 border border-green-600 text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center animate-fade-in">
              <Shield size={20} className="mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CLAN_DETAILS && (
          <ClanDetailsScreen
            userId={user._id}
            clanId={userClanId}
            userGold={user.gold}
            onClanLeft={handleClanLeft}
            onError={handleError}
          />
        )}

        {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CLAN_LIST && (
          <ClanListScreen
            userId={user._id}
            userClanId={userClanId}
            onClanJoined={handleClanJoined}
            onError={handleError}
            onCreateClan={handleCreateClan}
          />
        )}

        {currentMode === CLAN_SCREEN_CONSTANTS.MODES.CREATE_CLAN && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-6">
                <Plus size={48} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Create New Clan</h2>
                <p className="text-gray-300">
                  Start your own clan and invite other players to join your cause!
                </p>
              </div>

              <CreateClanForm
                userId={user._id}
                onCreated={handleClanCreated}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Default props
ClanScreen.defaultProps = {
  onUserUpdate: () => {},
  onError: () => {},
  onSuccess: () => {}
};

// Enhanced Navigation Link Component
export const ClanNavigationLink = ({ className, activeClassName = "text-yellow-400" }) => {
  const location = useLocation();
  const isActive = location.pathname === '/clan';
  
  return (
    <Link 
      to="/clan" 
      className={`
        ${className} 
        ${isActive ? activeClassName : "text-white hover:text-yellow-400"}
        flex items-center transition-colors duration-200
      `}
    >
      <Shield size={16} className="mr-2" />
      Clan
    </Link>
  );
};

export default ClanScreen;