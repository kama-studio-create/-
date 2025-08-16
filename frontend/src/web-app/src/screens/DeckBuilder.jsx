import React, { useEffect, useState } from 'react';

const DeckBuilder = () => {
  const [cards, setCards] = useState([]);
  const [deck, setDeck] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all cards and user data
    const loadData = async () => {
      try {
        // Get user ID from Telegram WebApp
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: '123456789' };
        
        // Fetch user data and all cards
        const [userResponse, cardsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/user/${telegramUser.id}`),
          fetch('http://localhost:5000/api/cards/all')
        ]);

        const userData = await userResponse.json();
        const cardsData = await cardsResponse.json();

        setUser(userData);
        setCards(cardsData);

        // Load user's current deck
        if (userData.deck && userData.deck.length > 0) {
          const deckCards = cardsData.filter(card => 
            userData.deck.includes(card._id)
          );
          setDeck(deckCards);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addToDeck = (card) => {
    // Check if deck is full
    if (deck.length >= 30) {
      alert('Deck is full! Maximum 30 cards allowed.');
      return;
    }

    // Check if user owns this card
    if (!user.cards.includes(card._id)) {
      alert('You do not own this card!');
      return;
    }

    // Add card to deck
    setDeck([...deck, card]);
  };

  const removeFromDeck = (cardId) => {
    setDeck(deck.filter(card => card._id !== cardId));
  };

  const saveDeck = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deck/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          deck: deck.map(c => c._id)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Deck saved successfully!');
      } else {
        alert(data.error || 'Failed to save deck');
      }
    } catch (error) {
      alert('Error saving deck: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  // Filter cards to show only owned ones
  const ownedCards = cards.filter(card => user.cards.includes(card._id));

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Deck Builder</h2>
        <div className="flex justify-between items-center">
          <p className="text-lg">Cards in deck: {deck.length}/30</p>
          <div className="space-x-2">
            <button 
              onClick={saveDeck}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Save Deck
            </button>
            <button 
              onClick={() => setDeck([])}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Current Deck */}
      {deck.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Current Deck</h3>
          <div className="grid grid-cols-5 gap-2">
            {deck.map((card, index) => (
              <div key={`${card._id}-${index}`} className="relative bg-gray-800 border rounded p-2">
                <img src={card.imageUrl} alt={card.name} className="w-full h-20 object-cover rounded" />
                <p className="text-sm mt-1 truncate">{card.name}</p>
                <button 
                  onClick={() => removeFromDeck(card._id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Your Cards ({ownedCards.length})</h3>
        
        {ownedCards.length === 0 ? (
          <p className="text-gray-400">You don't own any cards yet!</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {ownedCards.map(card => {
              const isInDeck = deck.some(c => c._id === card._id);
              const canAdd = !isInDeck && deck.length < 30;

              return (
                <div key={card._id} className="bg-gray-800 border rounded p-3 hover:bg-gray-700">
                  <img src={card.imageUrl} alt={card.name} className="w-full h-24 object-cover rounded mb-2" />
                  <h4 className="font-semibold truncate">{card.name}</h4>
                  <p className="text-sm text-gray-300 mb-2">Cost: {card.cost}</p>
                  
                  <button 
                    onClick={() => addToDeck(card)}
                    disabled={!canAdd}
                    className={`w-full py-1 px-2 rounded text-sm ${
                      isInDeck 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : canAdd
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isInDeck ? 'In Deck' : deck.length >= 30 ? 'Deck Full' : 'Add to Deck'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckBuilder;