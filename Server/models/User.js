const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    authentication_method: {
      type: String,
      enum: ['local', 'google', 'github'], // Add more methods if needed
      default: 'local',
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Add more roles if needed
      default: 'user',
    },
    two_factor_enabled: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
    },
    profile_picture: {
      type: String,
      default: '', // You can set a default profile picture URL
    },
    bio:{
      type: String,
      default: '',
      trim: true,
    },
    phone_number: {
      type: String,
      default: '', // Optional field
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds `created_at` and `updated_at`
  }
);

module.exports = mongoose.model('User', userSchema);