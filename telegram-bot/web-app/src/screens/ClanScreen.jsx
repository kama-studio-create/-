import React from 'react';
import ClanDetailsScreen from './ClanDetailsScreen';
import ClanPage from './ClanPage';

const ClanScreen = ({ user }) => {
  if (!user) return <div className="text-white p-4">Loading user...</div>;

  return (
    <>
      {user.clanId ? (
        <ClanDetailsScreen userId={user._id} clanId={user.clanId} />
      ) : (
        <ClanPage userId={user._id} />
      )}
    </>
  );
};

export default ClanScreen;

<Link to="/clan" className="text-white hover:text-yellow-400">🏘 Clan</Link>
