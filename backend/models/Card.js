const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CARD_TYPES = ['warrior', 'spell', 'equipment'];
const RARITY_TYPES = ['common', 'rare', 'epic', 'legendary'];

const CardSchema = new Schema({
  cardId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: CARD_TYPES,
    index: true
  },
  rarity: {
    type: String,
    required: true,
    enum: RARITY_TYPES,
    index: true
  },
  attack: {
    type: Number,
    required: function() { return this.type === 'warrior'; },
    min: 0,
    max: 9999
  },
  defense: {
    type: Number,
    required: function() { return this.type === 'warrior'; },
    min: 0,
    max: 9999
  },
  ability: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  manaCost: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CardSchema.index({ type: 1, rarity: 1 });
CardSchema.index({ name: 'text' });

// Virtual for card power level
CardSchema.virtual('powerLevel').get(function() {
  if (this.type === 'warrior') {
    return this.attack + this.defense;
  }
  return 0;
});

// Instance method to get card description
CardSchema.methods.getDescription = function() {
  return `${this.name} (${this.rarity} ${this.type})`;
};

// Static method to find cards by rarity
CardSchema.statics.findByRarity = function(rarity) {
  return this.find({ rarity: rarity });
};

// Middleware to validate card data before saving
CardSchema.pre('save', function(next) {
  if (this.type === 'warrior' && (!this.attack || !this.defense)) {
    next(new Error('Warrior cards must have attack and defense values'));
  }
  next();
});

module.exports = mongoose.model('Card', CardSchema);

// Create a new card
const newCard = new Card({
  cardId: 'W001',
  name: 'Dragon Warrior',
  type: 'warrior',
  rarity: 'legendary',
  attack: 800,
  defense: 600,
  ability: 'Deal 2x damage to spell cards',
  imageUrl: 'https://example.com/images/dragon-warrior.jpg',
  manaCost: 8
});

// Save the card
await newCard.save();

// Find legendary cards
const legendaryCards = await Card.findByRarity('legendary');

// Get card power level
console.log(newCard.powerLevel); // 1400
