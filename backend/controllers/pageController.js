const Page = require('../models/Page')

// Create a page (professors only)
exports.createPage = async (req, res) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Only professors can create pages' })
    }

    const { title, subject, description, targetProgram, targetYears } = req.body

    const page = await Page.create({
      title,
      subject,
      description,
      professorId: req.user.id,
      targetProgram: targetProgram || null,
      targetYears: targetYears || [],
    })

    res.status(201).json(page)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get all pages
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true })
      .populate('professorId', 'name department')
      .sort({ createdAt: -1 })

    res.status(200).json(pages)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get my pages (professor only)
exports.getMyPages = async (req, res) => {
  try {
    const pages = await Page.find({
      professorId: req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 })

    res.status(200).json(pages)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Follow a page
exports.followPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
    if (!page) return res.status(404).json({ message: 'Page not found' })

    const alreadyFollowing = page.followers.includes(req.user.id)

    if (alreadyFollowing) {
      page.followers = page.followers.filter(
        (id) => id.toString() !== req.user.id
      )
    } else {
      page.followers.push(req.user.id)
    }

    await page.save()
    res.status(200).json({
      following: !alreadyFollowing,
      followers: page.followers.length,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}