const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPost,
  deletePost,
  getTrending,
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Static GET routes (Must come first!)
router.get('/trending', authMiddleware, getTrending);

// 2. General GET routes
router.get('/', authMiddleware, getFeed);

// 3. Dynamic GET routes (Parameterized)
router.get('/:id', authMiddleware, getPost);

// 4. POST / DELETE routes
router.post('/', authMiddleware, createPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;