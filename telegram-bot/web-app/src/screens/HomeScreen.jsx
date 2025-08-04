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
      alert("Already claimed today or error occurred.");
    }
  };

  return (
    <div>
      {claimed ? (
        <p className="text-green-400">🎁 Claimed! +{reward} Gold</p>
      ) : (
        <button onClick={claimReward} className="bg-yellow-500 px-4 py-2 rounded-md">
          Claim Daily Reward
        </button>
      )}
    </div>
  );
};

import DailyRewardButton from '../components/DailyRewardButton';

const HomeScreen = ({ user }) => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-2">Welcome, {user?.username}</h1>

      {/* Daily Reward */}
      <DailyRewardButton userId={user?.id} />

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-4">
        <button className="bg-blue-600 px-4 py-2 rounded-md">Enter Battle</button>
        <button className="bg-gray-600 px-4 py-2 rounded-md">View Deck</button>
      </div>
    </div>
  );
};
