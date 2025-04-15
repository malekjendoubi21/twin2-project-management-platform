const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the MONGO_URI environment variable if available, otherwise default to localhost
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ProjectManagement';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${mongoURI}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;