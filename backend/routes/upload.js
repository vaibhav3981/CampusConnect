const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/upload
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the type in the result
    const isVideo = req.file.mimetype.startsWith('video/');

    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
      mediaType: isVideo ? 'video' : 'image',
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// DELETE /api/upload/:publicId
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    // We need to specify resource_type for videos, or use a generic destroy
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;