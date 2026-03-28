const Timetable = require('../models/Timetable')
const User = require('../models/User')

// Map: programme → departments allowed to manage it
const PROGRAMME_DEPT_MAP = {
  'Data Analysis':          ['MIFT', 'DIECII'],
  'Computer Science':       ['MIFT', 'DIECII'],
  'Mathematics':            ['MIFT'],
  'Physics':                ['MIFT'],
  'Civil Engineering':      ['DICAM'],
  'Environmental Engineering': ['DICAM'],
  'Economics':              ['ECONOMIA'],
  'Business Management':    ['ECONOMIA'],
  'Law':                    ['GIUR'],
  'Political Science':      ['SCIPOG'],
  'Medicine':               ['DIMED'],
  'Pharmacy':               ['CHIBIOFARAM'],
  'Chemistry':              ['CHIBIOFARAM'],
  'Biology':                ['CHIBIOFARAM'],
  'Veterinary':             ['VET'],
}

// Check if professor's department can manage a programme
const canManageProgramme = (department, programme) => {
  const allowed = PROGRAMME_DEPT_MAP[programme]
  if (!allowed) return false
  return allowed.includes(department)
}

// Upload or update a timetable — professors only
exports.uploadTimetable = async (req, res) => {
  try {
    const { programme, year, semester, academicYear, mediaUrl, mediaPublicId, mediaType } = req.body

    const professor = await User.findById(req.user.id).select('role department')
    if (professor.role !== 'professor') {
      return res.status(403).json({ message: 'Only professors can upload timetables' })
    }

    if (!canManageProgramme(professor.department, programme)) {
      return res.status(403).json({ message: `Your department cannot manage timetables for ${programme}` })
    }

    // Upsert — create or replace existing
    const timetable = await Timetable.findOneAndUpdate(
      { programme, year: Number(year), semester: Number(semester), academicYear },
      {
        mediaUrl,
        mediaPublicId: mediaPublicId || null,
        mediaType: mediaType || 'image',
        uploadedBy: req.user.id,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).populate('uploadedBy', 'name department')

    res.status(200).json(timetable)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get a specific timetable
exports.getTimetable = async (req, res) => {
  try {
    const { programme, year, semester } = req.params
    const academicYear = req.query.academicYear || '2025-2026'

    // Students may only fetch timetables for their own enrolled programme
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id).select('program')
      if (!student?.program || student.program !== programme) {
        return res.status(403).json({ message: 'You can only view timetables for your own programme' })
      }
    }

    // Professors may only fetch timetables they can manage
    if (req.user.role === 'professor') {
      const professor = await User.findById(req.user.id).select('department')
      if (!canManageProgramme(professor?.department, programme)) {
        return res.status(403).json({ message: 'Your department cannot access this programme timetable' })
      }
    }

    const timetable = await Timetable.findOne({
      programme,
      year: Number(year),
      semester: Number(semester),
      academicYear,
    }).populate('uploadedBy', 'name department')

    if (!timetable) return res.status(404).json({ message: 'Timetable not found' })
    res.status(200).json(timetable)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get all timetables (for listing)
exports.getAllTimetables = async (req, res) => {
  try {
    const { academicYear = '2025-2026' } = req.query
    const timetables = await Timetable.find({ academicYear })
      .populate('uploadedBy', 'name department')
      .sort({ programme: 1, year: 1, semester: 1 })
    res.status(200).json(timetables)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get what programmes a professor can manage
exports.getMyProgrammes = async (req, res) => {
  try {
    const professor = await User.findById(req.user.id).select('department role')
    if (professor.role !== 'professor') {
      return res.status(200).json([])
    }
    const programmes = Object.entries(PROGRAMME_DEPT_MAP)
      .filter(([, depts]) => depts.includes(professor.department))
      .map(([prog]) => prog)
    res.status(200).json(programmes)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}