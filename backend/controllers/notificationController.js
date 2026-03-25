const Notification = require('../models/Notification')
const User = require('../models/User')

// Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'name role avatarUrl')
      .populate('postId', 'textContent')

    res.status(200).json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    )
    res.status(200).json({ message: 'All marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Mark single notification as read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    res.status(200).json({ message: 'Marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get unread count — for navbar badge
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      isRead: false,
    })
    res.status(200).json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Internal helper — called from postController (not a route)
exports.createNotification = async ({ recipientId, senderId, type, postId, message }) => {
  try {
    if (recipientId.toString() === senderId.toString()) return
    await Notification.create({ recipientId, senderId, type, postId, message })
  } catch (err) {
    console.error('Notification error:', err.message)
  }
}