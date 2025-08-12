const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define message schema separately for better organization
const MessageSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxLength: 1000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const ClanSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 30
  },
  leader: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  members: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  treasury: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  messages: [MessageSchema],
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ClanSchema.index({ name: 1 });
ClanSchema.index({ level: -1 });

// Virtual for member count
ClanSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Methods
ClanSchema.methods.addMember = async function(userId) {
  if (this.members.includes(userId)) {
    throw new Error('User already in clan');
  }
  this.members.push(userId);
  return this.save();
};

ClanSchema.methods.removeMember = async function(userId) {
  if (userId.equals(this.leader)) {
    throw new Error('Cannot remove clan leader');
  }
  this.members = this.members.filter(id => !id.equals(userId));
  return this.save();
};

// Statics
ClanSchema.statics.findByName = function(name) {
  return this.findOne({ name: new RegExp(name, 'i') });
};

// Middleware
ClanSchema.pre('save', function(next) {
  if (this.members.length > 50) {
    next(new Error('Clan cannot have more than 50 members'));
  }
  next();
});

module.exports = mongoose.model('Clan', ClanSchema);
