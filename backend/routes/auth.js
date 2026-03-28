const express = require('express')
const router = express.Router()
const { register, login, getMe, updateProfile, searchUsers, getUserByMention, getUserById, followUser, acceptFollowRequest, declineFollowRequest } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)
router.put('/profile', authMiddleware, updateProfile)
router.get('/users/search',          authMiddleware, searchUsers)
router.get('/users/mention/:handle', authMiddleware, getUserByMention)
router.get('/users/:id',             authMiddleware, getUserById)
router.put('/users/:id/follow',         authMiddleware, followUser)
router.put('/users/:id/follow/accept',  authMiddleware, acceptFollowRequest)
router.delete('/users/:id/follow/decline', authMiddleware, declineFollowRequest)

module.exports = router