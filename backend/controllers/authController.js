const User = require('../models/User')
const Notification = require('../models/Notification')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, year, program, department, graduationYear, degree, matricola } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'Email already in use' })

    // Check matricola uniqueness for students
    if (role === 'student' && matricola) {
      const existingMatricola = await User.findOne({ matricola })
      if (existingMatricola) return res.status(400).json({ message: 'Matricola already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'student',
      year: year || null,
      program: program || null,
      department: department || null,
      graduationYear: graduationYear || null,
      degree: degree || null,
      matricola: role === 'student' ? (matricola || null) : null,
    })

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        program: user.program || null,
        department: user.department || null,
        matricola: user.matricola || null,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl || null,
        program: user.program || null,
        department: user.department || null,
        matricola: user.matricola || null,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, program, year, department, degree, graduationYear, avatarUrl, isPrivate } = req.body

    const updates = {}
    if (bio !== undefined) updates.bio = bio
    if (program !== undefined) updates.program = program
    if (year !== undefined) updates.year = year
    if (department !== undefined) updates.department = department
    if (degree !== undefined) updates.degree = degree
    if (graduationYear !== undefined) updates.graduationYear = graduationYear
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
    if (isPrivate !== undefined) updates.isPrivate = Boolean(isPrivate)

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash')

    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Look up user by @mention handle
exports.getUserByMention = async (req, res) => {
  try {
    const handle = req.params.handle.toLowerCase()
    const user = await User.findOne({
      $expr: {
        $eq: [
          { $toLower: { $replaceAll: { input: '$name', find: ' ', replacement: '' } } },
          handle,
        ],
      },
    }).select('_id name role')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get any user's public profile by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name role bio program year department degree graduationYear avatarUrl isVerified followers isPrivate matricola')
    if (!user) return res.status(404).json({ message: 'User not found' })
    const isOwnProfile = user._id.toString() === req.user.id
    const isFollowing = user.followers.some(f => f.toString() === req.user.id)
    const canViewPosts = !user.isPrivate || isOwnProfile || isFollowing

    const pendingRequest = isOwnProfile || isFollowing ? null : await Notification.findOne({
      recipientId: user._id,
      senderId: req.user.id,
      type: 'follow_request',
      isRead: false,
    })

    res.status(200).json({
      ...user.toObject(),
      followersCount: user.followers.length,
      isFollowing,
      hasRequested: !!pendingRequest,
      canViewPosts,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Toggle follow / unfollow — respects isPrivate
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id
    const myId = req.user.id
    if (targetId === myId) return res.status(400).json({ message: "Can't follow yourself" })

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'User not found' })

    const isFollowing = target.followers.some(f => f.toString() === myId)

    if (isFollowing) {
      // Unfollow — always immediate
      await Promise.all([
        User.findByIdAndUpdate(targetId, { $pull: { followers: myId } }),
        User.findByIdAndUpdate(myId, { $pull: { following: targetId } }),
      ])
      return res.json({ following: false, requested: false, followersCount: target.followers.length - 1, canViewPosts: !target.isPrivate })
    }

    if (target.isPrivate) {
      // Private account — toggle the pending follow request
      const existing = await Notification.findOne({
        recipientId: targetId, senderId: myId, type: 'follow_request', isRead: false,
      })
      if (existing) {
        // Cancel the request
        await existing.deleteOne()
        return res.json({ following: false, requested: false, followersCount: target.followers.length, canViewPosts: false })
      }
      await Notification.create({
        recipientId: targetId,
        senderId: myId,
        type: 'follow_request',
        message: 'wants to follow you',
      })
      return res.json({ following: false, requested: true, followersCount: target.followers.length, canViewPosts: false })
    }

    // Public account — immediate follow
    await Promise.all([
      User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } }),
      User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } }),
    ])
    res.json({ following: true, requested: false, followersCount: target.followers.length + 1, canViewPosts: true })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Accept a follow request
exports.acceptFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.id
    const myId = req.user.id

    const notif = await Notification.findOne({
      recipientId: myId, senderId: requesterId, type: 'follow_request',
    })
    if (!notif) return res.status(404).json({ message: 'Follow request not found' })

    await Promise.all([
      User.findByIdAndUpdate(myId, { $addToSet: { followers: requesterId } }),
      User.findByIdAndUpdate(requesterId, { $addToSet: { following: myId } }),
      notif.deleteOne(),
    ])

    res.json({ message: 'Follow request accepted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Decline a follow request
exports.declineFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.id
    const myId = req.user.id

    await Notification.findOneAndDelete({
      recipientId: myId, senderId: requesterId, type: 'follow_request',
    })

    res.json({ message: 'Follow request declined' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Search users — by name OR matricola
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 1) return res.status(200).json([])

    // If query is 4-6 digits, search by matricola; otherwise search by name
    const isMatricola = /^\d{4,6}$/.test(q.trim())

    const query = isMatricola
      ? { matricola: { $regex: q.trim(), $options: 'i' }, _id: { $ne: req.user.id } }
      : { name: { $regex: q, $options: 'i' }, _id: { $ne: req.user.id } }

    const users = await User.find(query)
      .select('name role avatarUrl department program matricola')
      .limit(10)

    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}