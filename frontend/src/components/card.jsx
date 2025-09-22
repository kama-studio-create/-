import React, { useState } from 'react';
import { Zap, Shield, Sword } from 'lucide-react';

const Card = ({ 
  card, 
  onClick, 
  disabled = false, 
  showStats = true, 
  size = 'normal',
  glowing = false,
  selected = false,
  quantity
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!card) {
    return (
      <div className={`
        ${size === 'small' ? 'w-20 h-28' : size === 'large' ? 'w-48 h-72' : 'w-32 h-48'} 
        border-2 border-dashed border-gray-600 bg-gray-800/50 
        rounded-lg flex items-center justify-center
        transition-all duration-300
      `}>
        <span className="text-gray-500 text-xs">Empty</span>
      </div>
    );
  }

  const rarityColors = {
    common: 'border-gray-400 bg-gradient-to-br from-gray-600 to-gray-800',
    uncommon: 'border-green-400 bg-gradient-to-br from-green-600 to-green-800',
    rare: 'border-blue-400 bg-gradient-to-br from-blue-600 to-blue-800',
    epic: 'border-purple-400 bg-gradient-to-br from-purple-600 to-purple-800',
    legendary: 'border-yellow-400 bg-gradient-to-br from-yellow-500 to-orange-600'
  };

  const getRarityColor = () => {
    return rarityColors[card.rarity?.toLowerCase()] || rarityColors.common;
  };

  const handleClick = () => {
    if (disabled || !onClick) return;
    onClick(card);
  };

  const sizeClasses = {
    small: 'w-20 h-28',
    normal: 'w-32 h-48',
    large: 'w-48 h-72'
  };

  const imageClasses = {
    small: 'h-16',
    normal: 'h-28',
    large: 'h-40'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        border-2 ${getRarityColor()} 
        rounded-lg p-1 
        transition-all duration-300 
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:scale-105 hover:shadow-xl'
        }
        ${selected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
        ${glowing ? 'animate-pulse shadow-lg shadow-yellow-400/50' : ''}
        ${isHovered ? 'transform scale-105' : ''}
        relative overflow-hidden
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mana Cost */}
      {card.manaCost !== undefined && (
        <div className="absolute top-1 left-1 z-10">
          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
            {card.manaCost}
          </div>
        </div>
      )}

      {/* Quantity Badge */}
      {quantity && quantity > 1 && (
        <div className="absolute top-1 right-1 z-10">
          <div className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-gray-600">
            {quantity}
          </div>
        </div>
      )}

      {/* Card Image */}
      <div className={`${imageClasses[size]} mb-1 rounded overflow-hidden bg-gray-700`}>
        {!imageError ? (
          <img 
            src={card.imageUrl || 'https://via.placeholder.com/150x200?text=No+Image'} 
            alt={card.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-600">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="text-white text-center">
        <div className={`font-bold truncate ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
          {card.name}
        </div>

        {showStats && (card.attack !== undefined || card.defense !== undefined) && (
          <div className={`flex justify-between items-center mt-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
            {card.attack !== undefined && (
              <div className="flex items-center text-red-400">
                <Sword size={size === 'small' ? 10 : 12} className="mr-1" />
                <span className="font-bold">{card.attack}</span>
              </div>
            )}
            {card.defense !== undefined && (
              <div className="flex items-center text-blue-400">
                <Shield size={size === 'small' ? 10 : 12} className="mr-1" />
                <span className="font-bold">{card.defense}</span>
              </div>
            )}
          </div>
        )}

        {card.type && (
          <div className="mt-1">
            <span className={`px-1 py-0.5 rounded text-xs bg-gray-800 text-gray-300`}>
              {card.type}
            </span>
          </div>
        )}
      </div>

      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none" />
      )}

      {disabled && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">Disabled</span>
        </div>
      )}
    </div>
  );
};

export default Card;