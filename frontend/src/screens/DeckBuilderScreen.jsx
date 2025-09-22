
import React, { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
// Enhanced Deck Builder Screen
const DeckBuilderScreen = ({ user, onSave, onError }) => {
  const [availableCards, setAvailableCards] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading cards
    setTimeout(() => {
      setAvailableCards([
        { id: 1, name: 'Fire Dragon', cost: 5, attack: 6, defense: 4, rarity: 'legendary', imageUrl: 'https://via.placeholder.com/150x200?text=Fire+Dragon' },
        { id: 2, name: 'Lightning Bolt', cost: 3, attack: 4, defense: 0, rarity: 'rare', imageUrl: 'https://via.placeholder.com/150x200?text=Lightning+Bolt' },
        { id: 3, name: 'Shield Guardian', cost: 4, attack: 2, defense: 6, rarity: 'common', imageUrl: 'https://via.placeholder.com/150x200?text=Shield+Guardian' },
        { id: 4, name: 'Mystic Healer', cost: 2, attack: 1, defense: 3, rarity: 'uncommon', imageUrl: 'https://via.placeholder.com/150x200?text=Mystic+Healer' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const addToDeck = (card) => {
    if (currentDeck.length >= 30) {
      onError?.('Deck is full! Maximum 30 cards allowed.');
      return;
    }
    setCurrentDeck([...currentDeck, card]);
  };

  const removeFromDeck = (index) => {
    setCurrentDeck(currentDeck.filter((_, i) => i !== index));
  };

  const saveDeck = () => {
    onSave?.(currentDeck);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Cards...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Shield size={32} className="mr-3 text-blue-400" />
                Deck Builder
              </h1>
              <p className="text-gray-300">Cards in deck: {currentDeck.length}/30</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={saveDeck}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
              >
                Save Deck
              </button>
              <button 
                onClick={() => setCurrentDeck([])}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Cards */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Available Cards</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCards.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    <img 
                      src={card.imageUrl} 
                      alt={card.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h3 className="text-white font-medium text-sm mb-1">{card.name}</h3>
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>⚡{card.cost}</span>
                      <span>⚔{card.attack}/🛡{card.defense}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.rarity === 'legendary' ? 'bg-yellow-600' :
                        card.rarity === 'rare' ? 'bg-purple-600' :
                        card.rarity === 'uncommon' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {card.rarity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToDeck(card);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Deck & Card Details */}
          <div>
            {/* Card Details */}
            {selectedCard && (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-3">Card Details</h3>
                <img 
                  src={selectedCard.imageUrl} 
                  alt={selectedCard.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h4 className="text-white font-medium mb-2">{selectedCard.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-blue-400">⚡{selectedCard.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attack:</span>
                    <span className="text-red-400">⚔{selectedCard.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Defense:</span>
                    <span className="text-green-400">🛡{selectedCard.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rarity:</span>
                    <span className={`${
                      selectedCard.rarity === 'legendary' ? 'text-yellow-400' :
                      selectedCard.rarity === 'rare' ? 'text-purple-400' :
                      selectedCard.rarity === 'uncommon' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {selectedCard.rarity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Deck */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Current Deck ({currentDeck.length}/30)</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentDeck.map((card, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <div className="flex items-center">
                      <img 
                        src={card.imageUrl} 
                        alt={card.name}
                        className="w-8 h-10 object-cover rounded mr-2"
                      />
                      <span className="text-white text-sm">{card.name}</span>
                    </div>
                    <button
                      onClick={() => removeFromDeck(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {currentDeck.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No cards in deck</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
