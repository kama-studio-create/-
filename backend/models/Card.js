const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  cardId: String,
  name: String,
  type: String, // 'warrior' | 'spell' | 'equipment'
  rarity: String,
  attack: Number,
  defense: Number,
  ability: String,
  imageUrl: String,
});

module.exports = mongoose.model('Card', CardSchema);
