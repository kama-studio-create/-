require('dotenv').config();
const mongoose = require('mongoose');
const runReferenceLeague = require('../utils/leaguePayout');

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function connectDB(retries = MAX_RETRIES) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📦 Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (retries > 0) {
      console.log(`⏳ Retrying connection in ${RETRY_DELAY/1000}s... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    return false;
  }
}

async function main() {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('❌ Failed to connect to database after multiple attempts');
      process.exit(1);
    }

    // Run league payout
    console.log('🏆 Starting Reference League payout...');
    await runReferenceLeague();
    console.log('✅ League payout completed successfully');

  } catch (error) {
    console.error('❌ Error running league:', error);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      await mongoose.connection.close();
      console.log('📦 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM signal');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT signal');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();
