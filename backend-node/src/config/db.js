// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careflow';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    
    // Set connection timeout low so it doesn't hang forever if MongoDB is not running
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000, 
      family: 4
    });
    
    console.log('✅ MongoDB Database Connected Successfully.');
    global.useMemoryDb = false;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Falling back to IN-MEMORY DATABASE mode.');
    console.warn('Reason for connection failure:', error.message);
    console.log('ℹ️ CareFlow AI will store data in system memory. Data will reset on server restart.');
    global.useMemoryDb = true;
  }
};

module.exports = connectDB;
