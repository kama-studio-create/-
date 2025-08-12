const mongoose = require('mongoose');
const Card = require('./models/Card');
require('dotenv').config();

// Enhanced card data with more variety
const cards = [
  {
    cardId: 'zeus001',
    name: 'Zeus, Thunder King',
    type: 'warrior',
    rarity: 'legendary',
    attack: 8,
    defense: 6,
    ability: 'Deals 3 lightning damage to all enemies.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Zeus'
  },
  {
    cardId: 'odin001',
    name: 'Odin, Allfather',
    type: 'warrior',
    rarity: 'epic',
    attack: 7,
    defense: 7,
    ability: 'Inspires all allies with +1 attack.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Odin'
  },
  {
    cardId: 'ares001',
    name: 'Ares, God of War',
    type: 'warrior',
    rarity: 'epic',
    attack: 9,
    defense: 4,
    ability: 'Gains +1 attack for each enemy defeated.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Ares'
  },
  {
    cardId: 'athena001',
    name: 'Athena, Wise Protector',
    type: 'warrior',
    rarity: 'rare',
    attack: 5,
    defense: 8,
    ability: 'All allies take 1 less damage.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Athena'
  },
  {
    cardId: 'thor001',
    name: 'Thor, God of Thunder',
    type: 'warrior',
    rarity: 'legendary',
    attack: 8,
    defense: 5,
    ability: 'Lightning Strike: Deal 2 damage to random enemy.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Thor'
  },
  {
    cardId: 'loki001',
    name: 'Loki, Trickster God',
    type: 'warrior',
    rarity: 'epic',
    attack: 4,
    defense: 6,
    ability: 'Copies the ability of target enemy warrior.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Loki'
  },
  // Spells
  {
    cardId: 'blessing_light',
    name: 'Blessing of Light',
    type: 'spell',
    rarity: 'common',
    attack: 0,
    defense: 0,
    ability: 'Restore 5 health to all allies.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Spell'
  },
  {
    cardId: 'lightning_bolt',
    name: 'Lightning Bolt',
    type: 'spell',
    rarity: 'common',
    attack: 0,
    defense: 0,
    ability: 'Deal 4 damage to target enemy.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Lightning'
  },
  {
    cardId: 'divine_shield',
    name: 'Divine Shield',
    type: 'spell',
    rarity: 'rare',
    attack: 0,
    defense: 0,
    ability: 'Target ally becomes immune to damage for 1 turn.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Shield'
  },
  {
    cardId: 'meteor_storm',
    name: 'Meteor Storm',
    type: 'spell',
    rarity: 'legendary',
    attack: 0,
    defense: 0,
    ability: 'Deal 2 damage to all enemies, then 1 damage next turn.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Meteor'
  }
];

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function seedCards() {
  try {
    console.log('🧹 Clearing existing cards...');
    const deleteResult = await Card.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing cards`);
    
    console.log('🌱 Seeding new cards...');
    const insertResult = await Card.insertMany(cards);
    console.log(`✅ Successfully seeded ${insertResult.length} cards`);
    
    // Display seeded cards summary
    const cardsByRarity = cards.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Card distribution:');
    Object.entries(cardsByRarity).forEach(([rarity, count]) => {
      console.log(`   ${rarity}: ${count} cards`);
    });
    
    const cardsByType = cards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🎴 Card types:');
    Object.entries(cardsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} cards`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

async function closeConnection() {
  try {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
}

// Main execution
(async () => {
  try {
    await connectDB();
    await seedCards();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding process failed:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
    process.exit(0);
  }
})();