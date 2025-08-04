import React, { useState } from 'react';
import axios from 'axios';

const DailyRewardButton = ({ userId }) => {
  const [claimed, setClaimed] = useState(false);
  const [reward, setReward] = useState(null);

  const claimReward = async () => {
    try {
      const res = await axios.post('/api/daily/claim', { userId });
      setReward(res.data.gold);
      setClaimed(true);
    } catch (err) {
      alert("Already claimed today or something went wrong.");
    }
  };

  return (
    <div className="mt-4">
      {claimed ? (
        <p className="text-green-400 text-sm">🎁 Claimed! +{reward} Gold</p>
      ) : (
        <button
          onClick={claimReward}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Claim Daily Reward
        </button>
      )}
    </div>
  );
};

export default DailyRewardButton;
