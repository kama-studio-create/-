import React from 'react';

const CardSlot = ({ card, onPlay }) => {
  if (!card) return <div className="w-24 h-36 border border-gray-600 bg-gray-800" />;

  return (
    <div
      className="w-24 h-36 border border-yellow-400 bg-black p-1 cursor-pointer hover:scale-105 transition"
      onClick={() => onPlay && onPlay(card)}
    >
      <img src={card.imageUrl} alt={card.name} className="w-full h-20 object-cover" />
      <div className="text-xs text-white mt-1">{card.name}</div>
    </div>
  );
};

export default CardSlot;
