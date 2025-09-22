const mongoose = require('mongoose');
const config = require('./environment');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        bufferMaxEntries: 0,
      };

      this.connection = await mongoose.connect(config.MONGODB_URI, options);
      
      console.log('✅ MongoDB connected successfully');
      this.setupEventListeners();
      return this.connection;
      
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${this.retryCount + 1}):`, error.message);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`⏳ Retrying in ${this.retryDelay / 1000}s...`);
        await this.delay(this.retryDelay);
        return this.connect();
      }
      
      console.error('❌ Max retries reached. Exiting...');
      process.exit(1);
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('📦 MongoDB connection established');
      this.retryCount = 0; // Reset retry count on successful connection
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }
}

module.exports = new DatabaseConnection();