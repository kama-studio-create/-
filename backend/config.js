require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Frontend URL for CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // MongoDB Configuration
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mythic-warriors',
    
    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    
    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
    },
    
    // Socket.IO Configuration
    socketOptions: {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    },
    
    // Game Configuration
    game: {
        maxPlayers: 2,
        maxDeckSize: 30,
        minDeckSize: 20,
        initialHandSize: 4,
        maxHandSize: 10,
        startingHealth: 30,
        startingMana: 1,
        maxMana: 10,
        turnTimeLimit: 60, // seconds
    },
    
    // Blockchain Configuration
    blockchain: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
        networkId: process.env.NETWORK_ID || '97',
        contractAddress: process.env.CONTRACT_ADDRESS
    }
};
