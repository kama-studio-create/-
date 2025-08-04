import React, { useEffect, useState } from 'react';

const DeckBuilder = () => {
  const [cards, setCards] = useState([]);
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/cards/all')
      .then(res => res.json())
      .then(data => setCards(data));
  }, []);

  const addToDeck = (card) => {
    if (deck.length >= 30) return;
    setDeck([...deck, card]);
  };

  return (
    <div className="p-4 text-white">
      <h2>Deck Builder</h2>
      <p>Cards in deck: {deck.length}/30</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <div key={card.cardId} className="border p-2 bg-gray-800">
            <img src={card.imageUrl} alt={card.name} className="w-full" />
            <p>{card.name}</p>
            <button onClick={() => addToDeck(card)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckBuilder;

const saveDeck = () => {
  fetch('http://localhost:5000/api/deck/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegramId: user?.id, // from Telegram WebApp SDK
      deck: deck.map(c => c.cardId)
    })
  }).then(res => res.json()).then(data => {
    alert(data.message || 'Saved!');
  });
};
