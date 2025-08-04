require('dotenv').config();
const mongoose = require('mongoose');
const runReferenceLeague = require('../utils/leaguePayout');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('📦 DB connected');
  await runReferenceLeague();
  process.exit();
});
