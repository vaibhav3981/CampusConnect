const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  uploadTimetable,
  getTimetable,
  getAllTimetables,
  getMyProgrammes,
} = require('../controllers/timetableController')

router.get('/',                                    auth, getAllTimetables)
router.get('/my-programmes',                       auth, getMyProgrammes)
router.get('/:programme/:year/:semester',          auth, getTimetable)
router.post('/',                                   auth, uploadTimetable)

module.exports = router