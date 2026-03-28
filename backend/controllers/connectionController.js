const Connection = require('../models/Connection')
const User = require('../models/User')
const Notification = require('../models/Notification')
const Follow = require('../models/Follow')

// Send connection request
exports.sendRequest = async (req, res) => {
  try {
    const targetId = req.params.userId
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'You cannot connect with yourself' })
    }

    const target = await User.findById(targetId).select('role name')
    if (!target) return res.status(404).json({ message: 'User not found' })
    if (target.role !== 'student') {
      return res.status(400).json({ message: 'Use follow for professors and alumni' })
    }

    await Connection.create({ requesterId: req.user.id, receiverId: targetId })

    // Notify the receiver
    const sender = await User.findById(req.user.id).select('name')
    await Notification.create({
      recipientId: targetId,
      senderId: req.user.id,
      type: 'connection_request',
      message: 'sent you a friend request',
    }).catch(() => {}) // never crash the main action

    res.status(201).json({ message: `Connection request sent to ${target.name}` })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Request already sent' })
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Accept request
exports.acceptRequest = async (req, res) => {
  try {
    const conn = await Connection.findOneAndUpdate(
      { requesterId: req.params.userId, receiverId: req.user.id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    )
    if (!conn) return res.status(404).json({ message: 'Request not found' })

    // Mark the connection_request notification as read
    await Notification.findOneAndUpdate(
      { recipientId: req.user.id, senderId: req.params.userId, type: 'connection_request' },
      { isRead: true }
    ).catch(() => {})

    res.status(200).json({ message: 'Connection accepted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Decline request
exports.declineRequest = async (req, res) => {
  try {
    await Connection.findOneAndDelete({
      requesterId: req.params.userId, receiverId: req.user.id, status: 'pending'
    })

    // Mark the notification as read
    await Notification.findOneAndUpdate(
      { recipientId: req.user.id, senderId: req.params.userId, type: 'connection_request' },
      { isRead: true }
    ).catch(() => {})

    res.status(200).json({ message: 'Request declined' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Remove connection
exports.removeConnection = async (req, res) => {
  try {
    await Connection.findOneAndDelete({
      $or: [
        { requesterId: req.user.id, receiverId: req.params.userId },
        { requesterId: req.params.userId, receiverId: req.user.id },
      ],
      status: 'accepted',
    })
    res.status(200).json({ message: 'Connection removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get connection status with a specific user
exports.getConnectionStatus = async (req, res) => {
  try {
    const conn = await Connection.findOne({
      $or: [
        { requesterId: req.user.id, receiverId: req.params.userId },
        { requesterId: req.params.userId, receiverId: req.user.id },
      ]
    })
    if (!conn) return res.status(200).json({ status: 'none' })
    if (conn.status === 'accepted') return res.status(200).json({ status: 'connected' })
    if (conn.requesterId.toString() === req.user.id) return res.status(200).json({ status: 'pending_sent' })
    return res.status(200).json({ status: 'pending_received' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get social counts for the current user (private — own profile only)
exports.getMyCounts = async (req, res) => {
  try {
    const userId = req.user.id
    const [connectionsCount, followingCount, followersCount] = await Promise.all([
      Connection.countDocuments({
        $or: [{ requesterId: userId }, { receiverId: userId }],
        status: 'accepted',
      }),
      Follow.countDocuments({ followerId: userId }),
      Follow.countDocuments({ followingId: userId }),
    ])
    res.status(200).json({ connectionsCount, followingCount, followersCount })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get all connections + pending requests
exports.getConnections = async (req, res) => {
  try {
    const accepted = await Connection.find({
      $or: [{ requesterId: req.user.id }, { receiverId: req.user.id }],
      status: 'accepted',
    }).populate('requesterId receiverId', 'name role avatarUrl')

    const pending = await Connection.find({
      receiverId: req.user.id, status: 'pending'
    }).populate('requesterId', 'name role avatarUrl')

    res.status(200).json({ connections: accepted, pendingRequests: pending })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}