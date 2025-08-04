const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

router.get('/all', async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

module.exports = router;
