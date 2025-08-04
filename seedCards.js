const mongoose = require('mongoose');
const Card = require('./models/Card');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error(err));

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
    cardId: 'blessing_light',
    name: 'Blessing of Light',
    type: 'spell',
    rarity: 'common',
    attack: 0,
    defense: 0,
    ability: 'Restore 5 health to all allies.',
    imageUrl: 'https://via.placeholder.com/150x200?text=Spell'
  },
];

(async () => {
  await Card.deleteMany({});
  await Card.insertMany(cards);
  console.log('Seeded cards ✅');
  process.exit();
})();
