const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:        { type: String, enum: ['like', 'comment', 'mention', 'announcement', 'connection_request', 'follow_request'], required: true },
    postId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    message:     { type: String, required: true },
    isRead:      { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)