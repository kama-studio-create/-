import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClanListScreen = ({ userId }) => {
  const [clans, setClans] = useState([]);
  const [joinedClanId, setJoinedClanId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/clans/list').then(res => {
      setClans(res.data);
    });
  }, []);

  const joinClan = async (clanId) => {
    try {
      const res = await axios.post('/api/clans/join', { userId, clanId });
      setJoinedClanId(clanId);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error joining clan');
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">🏘️ Available Clans</h1>

      {clans.length === 0 ? (
        <p>No clans yet. Create one!</p>
      ) : (
        <ul className="space-y-4">
          {clans.map(clan => (
            <li key={clan._id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{clan.name}</p>
                  <p className="text-sm text-gray-400">{clan.members.length} members</p>
                </div>
                <button
                  disabled={joinedClanId === clan._id}
                  onClick={() => joinClan(clan._id)}
                  className={`px-4 py-2 rounded-md ${
                    joinedClanId === clan._id
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {joinedClanId === clan._id ? 'Joined' : 'Join'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="mt-4 text-yellow-400">{message}</p>}
    </div>
  );
};

export default ClanListScreen;
