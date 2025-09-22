import React, { useState, useEffect } from 'react';
import { ShoppingCart, Coins, Loader2 } from 'lucide-react';

// Enhanced Marketplace Screen
const MarketplaceScreen = ({ user, onPurchase, onError }) => {
  const [listings, setListings] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [activeTab, setActiveTab] = useState('buy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading marketplace data
    setTimeout(() => {
      setListings([
        {
          id: 1,
          card: { name: 'Ancient Dragon', rarity: 'legendary', attack: 8, defense: 6 },
          price: 500,
          seller: 'DragonMaster',
          imageUrl: 'https://via.placeholder.com/150x200?text=Ancient+Dragon'
        },
        {
          id: 2,
          card: { name: 'Ice Shard', rarity: 'rare', attack: 4, defense: 2 },
          price: 150,
          seller: 'FrostWizard',
          imageUrl: 'https://via.placeholder.com/150x200?text=Ice+Shard'
        },
        {
          id: 3,
          card: { name: 'Healing Potion', rarity: 'common', attack: 0, defense: 0 },
          price: 50,
          seller: 'Alchemist',
          imageUrl: 'https://via.placeholder.com/150x200?text=Healing+Potion'
        }
      ]);
      setUserCards([
        {
          id: 4,
          name: 'Fire Elemental',
          rarity: 'rare',
          attack: 5,
          defense: 3,
          imageUrl: 'https://via.placeholder.com/150x200?text=Fire+Elemental'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const buyCard = (listing) => {
    if (user.gold < listing.price) {
      onError?.('Insufficient gold!');
      return;
    }
    onPurchase?.(listing);
    setListings(listings.filter(l => l.id !== listing.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Marketplace...</h2>
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
                <ShoppingCart size={32} className="mr-3 text-green-400" />
                Marketplace
              </h1>
              <p className="text-gray-300">Buy and sell cards with other players</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-2xl font-bold text-yellow-400 flex items-center">
                <Coins size={24} className="mr-2" />
                {user?.gold?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 p-4 text-center font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'bg-blue-600 text-white rounded-tl-xl'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🛒 Buy Cards
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 p-4 text-center font-medium transition-colors ${
                activeTab === 'sell'
                  ? 'bg-blue-600 text-white rounded-tr-xl'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 Sell Cards
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'buy' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                <img
                  src={listing.imageUrl}
                  alt={listing.card.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-bold text-white mb-2">{listing.card.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rarity:</span>
                    <span className={`${
                      listing.card.rarity === 'legendary' ? 'text-yellow-400' :
                      listing.card.rarity === 'rare' ? 'text-purple-400' :
                      listing.card.rarity === 'uncommon' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {listing.card.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Attack:</span>
                    <span className="text-red-400">⚔ {listing.card.attack}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Defense:</span>
                    <span className="text-blue-400">🛡 {listing.card.defense}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Seller:</span>
                    <span className="text-white">{listing.seller}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-400 flex items-center">
                    <Coins size={20} className="mr-1" />
                    {listing.price}
                  </span>
                  <button
                    onClick={() => buyCard(listing)}
                    disabled={user.gold < listing.price}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.gold >= listing.price
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userCards.map((card) => (
                <div key={card.id} className="bg-gray-700 rounded-xl p-6">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-white mb-2">{card.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rarity:</span>
                      <span className={`${
                        card.rarity === 'legendary' ? 'text-yellow-400' :
                        card.rarity === 'rare' ? 'text-purple-400' :
                        card.rarity === 'uncommon' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {card.rarity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Attack:</span>
                      <span className="text-red-400">⚔ {card.attack}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Defense:</span>
                      <span className="text-blue-400">🛡 {card.defense}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="Set price..."
                    className="w-full mb-3 p-2 bg-gray-600 text-white rounded"
                  />
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium transition-colors">
                    List for Sale
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
