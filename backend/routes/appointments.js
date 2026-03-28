const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
  createSlots, getMySlots, deleteSlot,
  getProfessors, getProfessorSlots,
  bookSlot, cancelBooking, getMyBookings,
} = require('../controllers/appointmentController')

// Professor routes
router.post('/slots',            auth, createSlots)
router.get('/slots/mine',        auth, getMySlots)
router.delete('/slots/:id',      auth, deleteSlot)

// Student routes
router.get('/professors',        auth, getProfessors)
router.get('/slots/:professorId',auth, getProfessorSlots)
router.post('/book/:slotId',     auth, bookSlot)
router.delete('/book/:slotId',   auth, cancelBooking)
router.get('/my-bookings',       auth, getMyBookings)

module.exports = router