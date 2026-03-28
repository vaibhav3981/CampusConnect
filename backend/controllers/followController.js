const Follow = require('../models/Follow')
const User = require('../models/User')

// Follow a professor or alumni
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.userId
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }

    const target = await User.findById(targetId).select('role name')
    if (!target) return res.status(404).json({ message: 'User not found' })
    if (target.role === 'student') {
      return res.status(400).json({ message: 'Use connections to add students' })
    }

    await Follow.create({ followerId: req.user.id, followingId: targetId })
    res.status(201).json({ message: `You are now following ${target.name}` })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already following' })
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Unfollow
exports.unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({ followerId: req.user.id, followingId: req.params.userId })
    res.status(200).json({ message: 'Unfollowed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Check if current user follows a specific user
exports.getFollowStatus = async (req, res) => {
  try {
    const follow = await Follow.findOne({ followerId: req.user.id, followingId: req.params.userId })
    res.status(200).json({ isFollowing: !!follow })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get who current user follows
exports.getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ followerId: req.user.id })
      .populate('followingId', 'name role avatarUrl isVerified')
    res.status(200).json(follows.map(f => f.followingId))
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get followers of a professor/alumni
exports.getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ followingId: req.params.userId })
      .populate('followerId', 'name role avatarUrl')
    res.status(200).json(follows.map(f => f.followerId))
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}