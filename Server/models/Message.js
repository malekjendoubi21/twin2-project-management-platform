const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    read_by: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      read_at: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);