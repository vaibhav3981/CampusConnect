const Post = require('../models/Post')
const Hashtag = require('../models/Hashtag')
const User = require('../models/User')

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

    // Fetch full user from DB — JWT only contains id and role
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

    // Filter announcements by audience using full user data
    const filtered = posts.filter((post) => {
      if (post.type !== 'announcement') return true
      if (post.audience.scope === 'all') return true

      // Targeted — check year and program match
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