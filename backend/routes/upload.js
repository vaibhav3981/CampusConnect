const express = require('express')
const router = express.Router()
const { upload, cloudinary } = require('../config/cloudinary')
const authMiddleware = require('../middleware/authMiddleware')

// Upload single image or video
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const isVideo = req.file.mimetype.startsWith('video/')

    res.status(200).json({
      url: req.file.path,
      publicId: req.file.filename,
      mediaType: isVideo ? 'video' : 'image',
      duration: req.file.duration || null,
    })
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message })
  }
})

// Delete media from Cloudinary
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params
    await cloudinary.uploader.destroy(publicId)
    res.status(200).json({ message: 'Media deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message })
  }
})

module.exports = router