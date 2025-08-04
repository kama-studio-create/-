import React, { useState } from 'react';
import axios from 'axios';

const CreateClanForm = ({ userId, onCreated }) => {
  const [clanName, setClanName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    if (!clanName) return setMessage('Please enter a name.');
    try {
      const res = await axios.post('/api/clans/create', { userId, clanName });
      setMessage(`✅ Clan "${res.data.name}" created!`);
      setClanName('');
      onCreated(); // refresh list
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating clan');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl mb-2">➕ Create a Clan</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={clanName}
          onChange={(e) => setClanName(e.target.value)}
          placeholder="Clan Name"
          className="px-3 py-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Create
        </button>
      </div>
      {message && <p className="mt-2 text-yellow-400">{message}</p>}
    </div>
  );
};

export default CreateClanForm;
