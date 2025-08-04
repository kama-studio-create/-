import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClanDetailsScreen = ({ userId, clanId }) => {
  const [clan, setClan] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!clanId) return;
    axios.get(`/api/clans/${clanId}`).then((res) => setClan(res.data));
  }, [clanId]);

  const leaveClan = async () => {
    try {
      await axios.post('/api/clans/leave', { userId });
      setClan(null);
      setMessage('You left the clan.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error leaving clan');
    }
  };

  if (!clan) {
    return (
      <div className="text-white p-4">
        {message || 'Not part of any clan.'}
      </div>
    );
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{clan.name}</h1>

      <p className="mb-2">👑 Leader: <strong>{clan.leader?.username || 'Unknown'}</strong></p>
      <p className="mb-4">💰 Treasury: <strong>{clan.treasury}</strong> gold</p>

      <h2 className="text-lg font-semibold mb-2">Members:</h2>
      <ul className="space-y-1 mb-6">
        {clan.members.map((member) => (
          <li key={member._id}>• {member.username}</li>
        ))}
      </ul>

      <button
        onClick={leaveClan}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Leave Clan
      </button>

      {message && <p className="mt-4 text-yellow-400">{message}</p>}
    </div>
  );
};

export default ClanDetailsScreen;

const [donation, setDonation] = useState(0);

{/* Donate gold to clan */}
<div className="mt-4">
  <h3 className="text-lg">Donate to Treasury</h3>
  <div className="flex gap-2 mt-2">
    <input
      type="number"
      value={donation}
      onChange={(e) => setDonation(e.target.value)}
      placeholder="Gold amount"
      className="px-3 py-1 rounded bg-gray-700 text-white w-32"
    />
    <button
      onClick={async () => {
        try {
          const res = await axios.post('/api/clans/donate', { userId, amount: Number(donation) });
          setMessage(res.data.message);
          setClan({ ...clan, treasury: res.data.clanTreasury });
        } catch (err) {
          setMessage(err.response?.data?.message || 'Error donating');
        }
      }}
      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-1 rounded"
    >
      Donate
    </button>
  </div>
</div>

{/* Message board */}
<div className="mt-6">
  <h3 className="text-lg font-semibold">📜 Message Board</h3>

  <ul className="bg-gray-800 p-2 rounded mt-2 max-h-40 overflow-y-auto">
    {clan.messages?.map((msg, i) => (
      <li key={i} className="text-sm mb-1">
        <strong>{msg.user?.username || 'User'}:</strong> {msg.text}
      </li>
    ))}
  </ul>

  <div className="mt-2 flex gap-2">
    <input
      type="text"
      placeholder="Write a message..."
      onKeyDown={async (e) => {
        if (e.key === 'Enter') {
          const text = e.target.value;
          if (!text.trim()) return;
          await axios.post('/api/clans/message', { userId, text });
          e.target.value = '';
          const updated = await axios.get(`/api/clans/${clanId}`);
          setClan(updated.data);
        }
      }}
      className="px-3 py-1 w-full bg-gray-700 text-white rounded"
    />
  </div>
</div>
