const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LISTING_CONSTANTS = {
  MIN_PRICE: 1,
  MAX_PRICE: 1000000,
  LISTING_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

const MarketListingSchema = new Schema({
  seller: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  cardId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Card', 
    required: true,
    index: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: LISTING_CONSTANTS.MIN_PRICE,
    max: LISTING_CONSTANTS.MAX_PRICE
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  soldAt: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: LISTING_CONSTANTS.LISTING_DURATION 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MarketListingSchema.index({ price: 1 });
MarketListingSchema.index({ createdAt: -1 });
MarketListingSchema.index({ status: 1, price: 1 });

// Virtual for time remaining
MarketListingSchema.virtual('timeRemaining').get(function() {
  const expiresAt = new Date(this.createdAt.getTime() + LISTING_CONSTANTS.LISTING_DURATION);
  return Math.max(0, expiresAt - Date.now());
});

// Methods
MarketListingSchema.methods.purchase = async function(buyerId) {
  if (this.status !== 'active') {
    throw new Error('Listing is not active');
  }
  
  this.status = 'sold';
  this.buyer = buyerId;
  this.soldAt = Date.now();
  return this.save();
};

MarketListingSchema.methods.cancel = async function() {
  if (this.status !== 'active') {
    throw new Error('Listing is not active');
  }
  
  this.status = 'cancelled';
  return this.save();
};

// Statics
MarketListingSchema.statics.getActiveListings = function(filters = {}) {
  return this.find({ 
    ...filters,
    status: 'active'
  })
  .sort({ createdAt: -1 })
  .populate('seller', 'username')
  .populate('cardId');
};

// Middleware
MarketListingSchema.pre('save', function(next) {
  if (this.isModified('price') && this.price < LISTING_CONSTANTS.MIN_PRICE) {
    next(new Error('Price cannot be less than minimum price'));
  }
  next();
});

module.exports = mongoose.model('MarketListing', MarketListingSchema);
