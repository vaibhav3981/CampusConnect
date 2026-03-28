const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostsByUser,
  getPost,
  deletePost,
  getTrending,
  likePost,
  addComment,
  deleteComment,
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Static GET routes (Must come first!)
router.get('/trending', authMiddleware, getTrending);

// 2. General GET routes
router.get('/', authMiddleware, getFeed);
router.get('/user/:userId', authMiddleware, getPostsByUser);

// 3. Dynamic GET routes (Parameterized)
router.get('/:id', authMiddleware, getPost);

// 4. POST / DELETE / PUT routes
router.post('/', authMiddleware, createPost);
router.delete('/:id', authMiddleware, deletePost);
router.put('/:id/like', authMiddleware, likePost);
router.post('/:id/comments', authMiddleware, addComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;
