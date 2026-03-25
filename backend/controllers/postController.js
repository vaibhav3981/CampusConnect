const Post = require('../models/Post')
const Hashtag = require('../models/Hashtag')
const User = require('../models/User')

const { createNotification } = require('./notificationController')

// Extract user IDs for @mention handles in text
const extractMentionedUserIds = async (text) => {
  const handles = [...new Set((text.match(/@(\w+)/g) || []).map(m => m.slice(1).toLowerCase()))]
  if (!handles.length) return []
  const users = await User.find({
    $expr: {
      $in: [
        { $toLower: { $replaceAll: { input: '$name', find: ' ', replacement: '' } } },
        handles,
      ],
    },
  }).select('_id')
  return users.map(u => u._id)
}

// Optimized hashtag helper
const extractHashtags = async (text) => {
  const matches = [...new Set(text.match(/#[a-zA-Z0-9_]+/g))]
  if (!matches) return []

  const hashtagIds = []

  for (const tag of matches) {
    const label = tag.slice(1).toLowerCase()

    const hashtag = await Hashtag.findOneAndUpdate(
      { label },
      {
        $inc: { postCount: 1, trendScore: 1 },
        $set: { lastActive: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    )

    hashtagIds.push(hashtag._id)
  }

  return hashtagIds
}

// Create a post
exports.createPost = async (req, res) => {
  try {
    const {
      textContent,
      mediaUrl,
      mediaType,
      mediaDuration,
      mediaPublicId,
      audience,
      type,
      pageId,
    } = req.body

    if (!textContent && !mediaUrl) {
      return res.status(400).json({ message: 'Post must have text or media' })
    }

    if (mediaType === 'video' && mediaDuration > 15) {
      return res.status(400).json({ message: 'Video must be 15 seconds or less' })
    }

    const hashtagIds = textContent ? await extractHashtags(textContent) : []

    const post = await Post.create({
      authorId: req.user.id,
      type: type || 'post',
      pageId: pageId || null,
      textContent,
      mediaUrl,
      mediaType,
      mediaDuration,
      mediaPublicId,
      hashtags: hashtagIds,
      audience: audience || { scope: 'all' },
    })

    await post.populate('authorId', 'name role avatarUrl')
    await post.populate('hashtags', 'label')
    await post.populate('votes.upvotes', '_id')

    if (textContent) {
      const mentionedIds = await extractMentionedUserIds(textContent)
      for (const uid of mentionedIds) {
        await createNotification({
          recipientId: uid,
          senderId: req.user.id,
          type: 'mention',
          postId: post._id,
          message: 'mentioned you in a post',
        })
      }
    }

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get feed
exports.getFeed = async (req, res) => {
  try {
    const { hashtag, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const fullUser = await User.findById(req.user.id).select('year program role')

    let query = {}

    if (hashtag) {
      const hashtagDoc = await Hashtag.findOne({ label: hashtag.toLowerCase() })
      if (!hashtagDoc) return res.status(200).json([])
      query.hashtags = hashtagDoc._id
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('authorId', 'name role avatarUrl isVerified')
      .populate('hashtags', 'label')
      .populate('votes.upvotes', '_id')

    const filtered = posts.filter((post) => {
      if (post.type !== 'announcement') return true
      if (post.audience.scope === 'all') return true
      if (fullUser.role === 'professor') return true
      if (fullUser.role === 'alumni') return true

      const yearMatch =
        post.audience.years.length === 0 ||
        post.audience.years.includes(fullUser.year)

      const programMatch =
        post.audience.programs.length === 0 ||
        post.audience.programs.includes(fullUser.program)

      return yearMatch && programMatch
    })

    res.status(200).json(filtered)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name role avatarUrl isVerified')
      .populate('hashtags', 'label')
      .populate('votes.upvotes', '_id')

    if (!post) return res.status(404).json({ message: 'Post not found' })

    res.status(200).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to delete this post' })
    }

    if (post.mediaPublicId) {
      const { cloudinary } = require('../config/cloudinary')
      await cloudinary.uploader.destroy(post.mediaPublicId)
    }

    await post.deleteOne()
    res.status(200).json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get trending hashtags
exports.getTrending = async (req, res) => {
  try {
    const hashtags = await Hashtag.find()
      .sort({ trendScore: -1 })
      .limit(10)

    res.status(200).json(hashtags)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Like / unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const userId = req.user.id
    const alreadyLiked = post.votes.upvotes.map(id => id.toString()).includes(userId)

    if (alreadyLiked) {
      post.votes.upvotes = post.votes.upvotes.filter(
        (id) => id.toString() !== userId
      )
      post.votes.score -= 1
    } else {
      post.votes.upvotes.push(userId)
      post.votes.score += 1
    }

    await post.save()

    if (!alreadyLiked) {
      await createNotification({
        recipientId: post.authorId,
        senderId: userId,
        type: 'like',
        postId: post._id,
        message: 'liked your post',
      })
    }

    res.status(200).json({
      liked: !alreadyLiked,
      score: post.votes.score,
      upvotes: post.votes.upvotes,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Add comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (!req.body.textContent?.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' })
    }

    const user = await User.findById(req.user.id).select('name')

    post.comments.push({
      authorId: req.user.id,
      authorName: user.name,
      textContent: req.body.textContent,
    })

    await post.save()

    await createNotification({
      recipientId: post.authorId,
      senderId: req.user.id,
      type: 'comment',
      postId: post._id,
      message: 'commented on your post',
    })

    const mentionedIds = await extractMentionedUserIds(req.body.textContent)
    for (const uid of mentionedIds) {
      await createNotification({
        recipientId: uid,
        senderId: req.user.id,
        type: 'mention',
        postId: post._id,
        message: 'mentioned you in a comment',
      })
    }

    await post.populate('authorId', 'name role avatarUrl isVerified')
    await post.populate('hashtags', 'label')
    await post.populate('votes.upvotes', '_id')

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = post.comments.id(req.params.commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    const isCommentAuthor = comment.authorId.toString() === req.user.id
    const isPostAuthor = post.authorId.toString() === req.user.id

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorised to delete this comment' })
    }

    comment.deleteOne()
    await post.save()
    await post.populate('authorId', 'name role avatarUrl isVerified')
    await post.populate('hashtags', 'label')
    await post.populate('votes.upvotes', '_id')

    res.status(200).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}