const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Speeds up "find my posts"
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['post', 'announcement'],
      default: 'post',
    },

    // Content
    textContent: {
      type: String,
      default: '',
      maxlength: 500,
    },
    mediaUrl: { type: String, default: null },
    mediaType: {
      type: String,
      enum: ['image', 'video', null], // 'text' removed — redundant
      default: null,
    },
    mediaPublicId: { type: String, default: null },
    mediaDuration: {
      type: Number,
      default: null,
      max: 15, // Shorts/Stories style
    },

    // Hashtags
    hashtags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hashtag',
        index: true, // Critical for hashtag feed
      },
    ],

    // Audience targeting (for announcements)
    audience: {
      scope: {
        type: String,
        enum: ['all', 'targeted'],
        default: 'all',
      },
      years: { type: [Number], default: [] },
      programs: { type: [String], default: [] },
      courseCodes: { type: [String], default: [] },
    },

    // Votes (parked for later)
    votes: {
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      score: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
)

// Compound index — optimizes fetching newest posts first
postSchema.index({ createdAt: -1 })


module.exports = mongoose.model('Post', postSchema)
