import React from 'react';

const PlayerInfo = ({ username, hp, mana }) => {
  return (
    <div className="flex flex-col items-start text-white p-3 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">{username || 'You'}</h2>

      <div className="mt-2 w-full">
        <label className="text-sm text-gray-300">HP</label>
        <div className="w-full h-4 bg-red-800 rounded">
          <div
            className="h-4 bg-red-500 rounded"
            style={{ width: `${hp}%`, transition: 'width 0.3s ease-in-out' }}
          />
        </div>
        <p className="text-sm mt-1">{hp} / 100</p>
      </div>

      <div className="mt-2 w-full">
        <label className="text-sm text-gray-300">Mana</label>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: mana }).map((_, i) => (
            <div key={i} className="w-3 h-5 bg-blue-500 rounded-sm"></div>
          ))}
        </div>
        <p className="text-sm mt-1">{mana} Mana</p>
      </div>
    </div>
  );
};

export default PlayerInfo;
