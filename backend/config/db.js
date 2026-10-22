const mongoose = require('mongoose');

// Enable Mongoose Debug mode to print all background MongoDB queries in real-time
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`\x1b[36m[MongoDB Query]\x1b[0m \x1b[33m${collectionName}.${method}\x1b[0m(${JSON.stringify(query)})`);
});

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_db';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    console.log('🔍 Real-time query logging enabled in terminal!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
module.exports = connectDB;