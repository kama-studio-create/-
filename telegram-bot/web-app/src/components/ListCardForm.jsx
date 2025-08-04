import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListCardForm = ({ userId }) => {
  const [ownedCards, setOwnedCards] = useState([]);
  const [price, setPrice] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/cards/user/${userId}`).then((res) => {
      setOwnedCards(res.data);
    });
  }, [userId]);

  const listCard = async () => {
    try {
      const res = await axios.post('/api/marketplace/list', {
        userId,
        cardId: selectedCard,
        price: Number(price),
      });
      setMessage(res.data.message);
      setPrice('');
      setSelectedCard('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error listing card');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded mt-6 text-white">
      <h2 className="text-xl font-bold mb-4">📤 List a Card</h2>

      <div className="mb-2">
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
        >
          <option value="">-- Select Card --</option>
          {ownedCards.map((card) => (
            <option key={card._id} value={card._id}>
              {card.name} (Rarity: {card.rarity})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <input
          type="number"
          placeholder="Price (tokens)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
        />
      </div>

      <button
        onClick={listCard}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
      >
        List Card
      </button>

      {message && <p className="mt-3 text-yellow-400">{message}</p>}
    </div>
  );
};

export default ListCardForm;
