const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:      { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
)

// Prevent duplicate requests
connectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true })

module.exports = mongoose.model('Connection', connectionSchema)