import React from 'react';
import { motion } from 'framer-motion';

const CardSlot = ({ card, isAttacking, isCritical }) => {
  if (!card) return null;

  return (
    <motion.div
      className={`relative p-2 border-2 rounded-lg shadow-lg ${
        isCritical ? 'border-red-500 shadow-red-500' : 'border-white'
      }`}
      animate={isAttacking ? { x: [-10, 10, -5, 5, 0] } : { opacity: [0, 1] }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={card.imageUrl}
        alt={card.name}
        className="w-24 h-32 object-cover rounded"
      />
      <p className="text-center text-white mt-1">{card.name}</p>
      {isCritical && (
        <span className="absolute top-1 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
          CRITICAL!
        </span>
      )}
    </motion.div>
  );
};

export default CardSlot;
