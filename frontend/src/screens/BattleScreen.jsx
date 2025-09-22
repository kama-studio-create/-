import React, { useState, useEffect } from 'react';
import { Heart, Zap, Loader2 } from 'lucide-react';

// Enhanced Battle Screen
const BattleScreen = ({ user, onBattleEnd }) => {
  const [battleState, setBattleState] = useState({
    playerHp: 100,
    enemyHp: 100,
    playerMana: 3,
    turn: 'player',
    hand: [],
    battleLog: [],
    gameOver: false,
    result: null
  });

  useEffect(() => {
    // Initialize battle
    setBattleState(prev => ({
      ...prev,
      hand: [
        { id: 1, name: 'Fire Bolt', cost: 2, damage: 3 },
        { id: 2, name: 'Shield', cost: 1, shield: 2 },
        { id: 3, name: 'Lightning', cost: 3, damage: 5 }
      ],
      battleLog: ['Battle begins!', 'Your turn - choose a card to play']
    }));
  }, []);

  const playCard = (card) => {
    if (battleState.turn !== 'player' || battleState.gameOver) return;
    if (card.cost > battleState.playerMana) return;

    const damage = card.damage || 0;
    const newEnemyHp = Math.max(0, battleState.enemyHp - damage);
    
    setBattleState(prev => ({
      ...prev,
      enemyHp: newEnemyHp,
      playerMana: prev.playerMana - card.cost,
      hand: prev.hand.filter(c => c.id !== card.id),
      battleLog: [...prev.battleLog, `You played ${card.name}${damage ? ` for ${damage} damage` : ''}`],
      turn: newEnemyHp > 0 ? 'enemy' : 'player',
      gameOver: newEnemyHp === 0,
      result: newEnemyHp === 0 ? 'victory' : null
    }));

    // Enemy turn
    if (newEnemyHp > 0) {
      setTimeout(() => {
        const enemyDamage = Math.floor(Math.random() * 4) + 2;
        const newPlayerHp = Math.max(0, battleState.playerHp - enemyDamage);
        
        setBattleState(prev => ({
          ...prev,
          playerHp: newPlayerHp,
          playerMana: Math.min(10, prev.playerMana + 1),
          battleLog: [...prev.battleLog, `Enemy attacks for ${enemyDamage} damage`],
          turn: 'player',
          gameOver: newPlayerHp === 0,
          result: newPlayerHp === 0 ? 'defeat' : null
        }));
      }, 1500);
    }
  };

  const endBattle = () => {
    onBattleEnd?.(battleState.result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Battle Arena */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">You</h3>
              <div className="flex items-center mt-2">
                <Heart size={20} className="text-red-400 mr-2" />
                <div className="w-32 bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${battleState.playerHp}%` }}
                  />
                </div>
                <span className="text-white ml-2">{battleState.playerHp}/100</span>
              </div>
              <div className="flex items-center mt-2">
                <Zap size={20} className="text-blue-400 mr-2" />
                <span className="text-white">{battleState.playerMana}/10 Mana</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <p className="text-white">VS</p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Enemy</h3>
              <div className="flex items-center mt-2">
                <Heart size={20} className="text-red-400 mr-2" />
                <div className="w-32 bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${battleState.enemyHp}%` }}
                  />
                </div>
                <span className="text-white ml-2">{battleState.enemyHp}/100</span>
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="bg-gray-900/50 rounded-lg p-4 h-32 overflow-y-auto">
            {battleState.battleLog.map((log, index) => (
              <p key={index} className="text-gray-300 text-sm mb-1">{log}</p>
            ))}
          </div>
        </div>

        {/* Hand */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Hand</h3>
          <div className="flex gap-4 justify-center">
            {battleState.hand.map((card) => (
              <div 
                key={card.id}
                className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                  card.cost > battleState.playerMana || battleState.turn !== 'player' || battleState.gameOver
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-600'
                }`}
                onClick={() => playCard(card)}
              >
                <h4 className="text-white font-medium mb-2">{card.name}</h4>
                <div className="text-sm text-gray-300">
                  <p>Cost: {card.cost}</p>
                  {card.damage && <p className="text-red-400">Damage: {card.damage}</p>}
                  {card.shield && <p className="text-blue-400">Shield: +{card.shield}</p>}
                </div>
              </div>
            ))}
          </div>
          
          {battleState.turn === 'enemy' && !battleState.gameOver && (
            <p className="text-center text-yellow-400 mt-4">Enemy's turn...</p>
          )}
        </div>

        {/* Game Over Overlay */}
        {battleState.gameOver && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {battleState.result === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}
              </h2>
              <p className="text-gray-300 mb-6">
                {battleState.result === 'victory' 
                  ? 'Congratulations! You have emerged victorious!' 
                  : 'Better luck next time, warrior.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={endBattle}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                >
                  Battle Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
