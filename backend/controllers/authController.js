const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, year, program, department, graduationYear, degree } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
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
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

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
    const { bio, program, year, department, degree, graduationYear, avatarUrl } = req.body

    const updates = {}
    if (bio !== undefined) updates.bio = bio
    if (program !== undefined) updates.program = program
    if (year !== undefined) updates.year = year
    if (department !== undefined) updates.department = department
    if (degree !== undefined) updates.degree = degree
    if (graduationYear !== undefined) updates.graduationYear = graduationYear
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl

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
    const user = await User.findById(req.params.id).select('name role bio program year department degree graduationYear avatarUrl isVerified')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Search users for @ mentions
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 1) return res.status(200).json([])

    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      _id: { $ne: req.user.id },
    })
      .select('name role avatarUrl')
      .limit(5)

    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}