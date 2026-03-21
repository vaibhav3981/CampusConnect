const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      default: null,
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
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'text', null],
      default: null,
    },
    mediaPublicId: {
      type: String,
      default: null,
    },
    mediaDuration: {
      type: Number,
      default: null,
      max: 15,
    },

    // Hashtags
    hashtags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hashtag',
      },
    ],

    // Audience targeting (for announcements)
    audience: {
      scope: {
        type: String,
        enum: ['all', 'targeted'],
        default: 'all',
      },
      years: {
        type: [Number],
        default: [],
      },
      programs: {
        type: [String],
        default: [],
      },
      courseCodes: {
        type: [String],
        default: [],
      },
    },

    // Votes (parked for later)
    votes: {
      upvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
      },
      downvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
      },
      score: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Validation — at least text or media must be present
postSchema.pre('save', function (next) {
  if (!this.textContent && !this.mediaUrl) {
    return next(new Error('A post must have either text or media'))
  }
  next()
})

module.exports = mongoose.model('Post', postSchema)