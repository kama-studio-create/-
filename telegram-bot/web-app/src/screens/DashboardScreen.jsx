import React from 'react';
import DailyRewardButton from '../components/DailyRewardButton';

const DashboardScreen = ({ user }) => {
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username || "Guest"}</h2>
      <DailyRewardButton userId={user?._id} />
      <p className="mt-4">Check your cards, battle opponents, and climb the leaderboard!</p>
    </div>
  );
};

export default DashboardScreen;
