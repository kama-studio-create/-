const mongoose = require('mongoose');

const MarketListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  price: { type: Number, required: true }, // token price
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketListing', MarketListingSchema);
