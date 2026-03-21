const mongoose = require('mongoose')

const hashtagSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    trendScore: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Hashtag', hashtagSchema)