import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">⚔️ Mythic Warriors</h2>
        <p className="text-gray-300">Loading your adventure...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;