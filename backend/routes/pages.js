const express = require('express');
const router = express.Router();
const {
  createPage,
  getPages,
  getMyPages,
  followPage,
} = require('../controllers/pageController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Static routes first
router.get('/my', authMiddleware, getMyPages);

// 2. General routes
router.get('/', authMiddleware, getPages);

// 3. Dynamic routes
router.post('/', authMiddleware, createPage);
router.put('/:id/follow', authMiddleware, followPage);

module.exports = router;