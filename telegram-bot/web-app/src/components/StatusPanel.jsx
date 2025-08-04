import React from 'react';
import { Heart, Zap } from 'lucide-react'; // icon set (you can switch)

const StatusPanel = ({ isPlayer, name, hp, mana }) => {
  const displayName = name || (isPlayer ? 'You' : 'Enemy');

  return (
    <div className={`flex flex-col p-3 rounded-xl shadow-md w-full max-w-xs ${
      isPlayer ? 'bg-gray-800 text-white' : 'bg-gray-900 text-red-200'
    }`}>
      <h2 className="text-lg font-bold mb-2">{displayName}</h2>

      {/* HP */}
      <div className="mb-2 w-full">
        <div className="flex items-center gap-2 text-sm">
          <Heart size={16} className="text-red-500" />
          <span>{hp} / 100</span>
        </div>
        <div className="h-2 w-full bg-red-700 rounded mt-1">
          <div
            className="h-2 bg-red-500 rounded"
            style={{ width: `${hp}%`, transition: 'width 0.3s ease' }}
          />
        </div>
      </div>

      {/* Mana (Only for player) */}
      {isPlayer && (
        <div className="w-full">
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} className="text-blue-400" />
            <span>{mana} Mana</span>
          </div>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: mana }).map((_, i) => (
              <div key={i} className="w-3 h-5 bg-blue-500 rounded-sm"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPanel;
