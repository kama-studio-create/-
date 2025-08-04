import React, { useState } from 'react';
import axios from 'axios';

const ReferralSubmit = ({ userId }) => {
  const [referrerId, setReferrerId] = useState('');
  const [message, setMessage] = useState('');

  const submitReferral = async () => {
    try {
      const res = await axios.post('/api/league/add-referral', {
        referrerId,
        referredUserId: userId,
        spentTokens: 0 // update this based on real spending if needed
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error submitting referral');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl text-white font-bold mb-2">🎯 Enter Referral</h2>
      <input
        type="text"
        value={referrerId}
        onChange={(e) => setReferrerId(e.target.value)}
        placeholder="Referrer's User ID"
        className="bg-gray-700 text-white px-4 py-2 mr-2 rounded"
      />
      <button
        onClick={submitReferral}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
      {message && <p className="mt-2 text-green-400">{message}</p>}
    </div>
  );
};

export default ReferralSubmit;
