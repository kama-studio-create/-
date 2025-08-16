import React from 'react';

// Constants
const CARD_CONSTANTS = {
  WIDTH: 'w-24',
  HEIGHT: 'h-36',
  IMAGE_HEIGHT: 'h-20',
  BORDER_RADIUS: 'rounded-lg',
  TRANSITION_DURATION: 'transition-all duration-300',
  HOVER_SCALE: 'hover:scale-105',
  HOVER_SHADOW: 'hover:shadow-lg hover:shadow-yellow-400/50',
  MIN_CARD_NAME_LENGTH: 1,
  MAX_CARD_NAME_LENGTH: 15
};

// Card rarity colors
const RARITY_COLORS = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400', 
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

const CardSlot = ({ 
  card, 
  onPlay, 
  disabled = false, 
  showStats = true, 
  size = 'normal',
  glowing = false 
}) => {
  // Empty slot
  if (!card) {
    return (
      <div 
        className={`
          ${CARD_CONSTANTS.WIDTH} ${CARD_CONSTANTS.HEIGHT} 
          border-2 border-dashed border-gray-600 bg-gray-800/50 
          ${CARD_CONSTANTS.BORDER_RADIUS} flex items-center justify-center
          ${CARD_CONSTANTS.TRANSITION_DURATION}
        `}
      >
        <span className="text-gray-500 text-xs">Empty</span>
      </div>
    );
  }

  // Validation
  const isValidCard = card && card.name && card.imageUrl;
  if (!isValidCard) {
    return (
      <div className={`${CARD_CONSTANTS.WIDTH} ${CARD_CONSTANTS.HEIGHT} border-2 border-red-500 bg-red-900/20 ${CARD_CONSTANTS.BORDER_RADIUS} flex items-center justify-center`}>
        <span className="text-red-400 text-xs">Invalid Card</span>
      </div>
    );
  }

  // Get border color based on rarity
  const getBorderColor = () => {
    return RARITY_COLORS[card.rarity?.toLowerCase()] || RARITY_COLORS.common;
  };

  // Truncate long card names
  const getDisplayName = () => {
    if (!card.name) return 'Unknown';
    return card.name.length > CARD_CONSTANTS.MAX_CARD_NAME_LENGTH 
      ? `${card.name.substring(0, CARD_CONSTANTS.MAX_CARD_NAME_LENGTH)}...`
      : card.name;
  };

  // Handle click with validation
  const handleClick = () => {
    if (disabled || !onPlay) return;
    
    try {
      onPlay(card);
    } catch (error) {
      console.error('Error playing card:', error);
    }
  };

  // Dynamic classes
  const cardClasses = `
    ${CARD_CONSTANTS.WIDTH} ${CARD_CONSTANTS.HEIGHT} 
    border-2 ${getBorderColor()} 
    bg-gradient-to-b from-gray-900 to-black 
    ${CARD_CONSTANTS.BORDER_RADIUS} p-1 
    ${CARD_CONSTANTS.TRANSITION_DURATION}
    ${disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : `cursor-pointer ${CARD_CONSTANTS.HOVER_SCALE} ${CARD_CONSTANTS.HOVER_SHADOW}`
    }
    ${glowing ? 'animate-pulse shadow-lg shadow-yellow-400/50' : ''}
    relative overflow-hidden
  `.trim();

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Card Image */}
      <div className="relative">
        <img 
          src={card.imageUrl} 
          alt={card.name}
          className={`w-full ${CARD_CONSTANTS.IMAGE_HEIGHT} object-cover ${CARD_CONSTANTS.BORDER_RADIUS}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
          }}
        />
        
        {/* Rarity gem */}
        {card.rarity && (
          <div className="absolute top-1 right-1">
            <div className={`w-3 h-3 rounded-full ${getBorderColor().replace('border-', 'bg-')}`} />
          </div>
        )}

        {/* Mana cost */}
        {card.manaCost !== undefined && (
          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {card.manaCost}
          </div>
        )}
      </div>

      {/* Card Name */}
      <div className="text-xs text-white mt-1 text-center font-medium truncate">
        {getDisplayName()}
      </div>

      {/* Stats (if enabled) */}
      {showStats && (card.attack !== undefined || card.defense !== undefined) && (
        <div className="flex justify-between text-xs mt-1">
          {card.attack !== undefined && (
            <span className="text-red-400 font-bold">⚔{card.attack}</span>
          )}
          {card.defense !== undefined && (
            <span className="text-blue-400 font-bold">🛡{card.defense}</span>
          )}
        </div>
      )}

      {/* Card Type Icon */}
      {card.type && (
        <div className="absolute bottom-1 right-1">
          <span className="text-xs">
            {card.type === 'warrior' && '⚔️'}
            {card.type === 'spell' && '✨'}
            {card.type === 'equipment' && '🛡️'}
          </span>
        </div>
      )}

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-xs">Disabled</span>
        </div>
      )}
    </div>
  );
};

// Static methods for common operations
CardSlot.isEmpty = (card) => !card;
CardSlot.isValid = (card) => card && card.name && card.imageUrl;
CardSlot.getRarity = (card) => card?.rarity?.toLowerCase() || 'common';

export default CardSlot;