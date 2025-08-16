import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarketplaceScreen = ({ userId }) => {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const res = await axios.get('/api/marketplace/listings');
    setListings(res.data);
  };

  const buyCard = async (listingId) => {
    try {
      const res = await axios.post('/api/marketplace/buy', { userId, listingId });
      setMessage(res.data.message);
      fetchListings(); // Refresh listings
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error buying card');
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🛒 Marketplace</h1>

      {message && <p className="text-yellow-400 mb-4">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((item) => (
          <div key={item._id} className="bg-gray-800 p-4 rounded shadow">
            <p className="text-lg font-semibold">{item.cardId.name}</p>
            <p className="text-sm text-gray-400">Rarity: {item.cardId.rarity}</p>
            <p className="text-sm text-green-400">Price: {item.price} tokens</p>
            <p className="text-sm text-gray-500">Seller: {item.seller.username}</p>
            <button
              onClick={() => buyCard(item._id)}
              className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceScreen;
