const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { followUser, unfollowUser, getFollowStatus, getFollowing, getFollowers } = require('../controllers/followController')

router.post('/:userId',         auth, followUser)
router.delete('/:userId',       auth, unfollowUser)
router.get('/status/:userId',   auth, getFollowStatus)
router.get('/following',        auth, getFollowing)
router.get('/followers/:userId',auth, getFollowers)

module.exports = router