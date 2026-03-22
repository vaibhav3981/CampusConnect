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
    const { bio, program, year, department, degree, graduationYear } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          bio,
          program,
          year,
          department,
          degree,
          graduationYear,
        },
      },
      { new: true }
    ).select('-passwordHash')

    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}