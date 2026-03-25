const express = require('express')
const router = express.Router()
const { register, login, getMe, updateProfile, searchUsers, getUserByMention, getUserById } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)
router.put('/profile', authMiddleware, updateProfile)
router.get('/users/search',          authMiddleware, searchUsers)
router.get('/users/mention/:handle', authMiddleware, getUserByMention)
router.get('/users/:id',             authMiddleware, getUserById)

module.exports = router