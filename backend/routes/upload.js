const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload media to Cloudinary
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
      mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// @route   DELETE /api/upload/:publicId
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;