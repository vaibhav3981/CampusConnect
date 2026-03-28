const AppointmentSlot = require('../models/AppointmentSlot')
const User = require('../models/User')

// ── PROFESSOR: Create slots ──
exports.createSlots = async (req, res) => {
  try {
    const professor = await User.findById(req.user.id).select('role')
    if (professor.role !== 'professor') {
      return res.status(403).json({ message: 'Only professors can create slots' })
    }

    const { slots } = req.body // array of { date, startTime, endTime, note }
    if (!slots?.length) return res.status(400).json({ message: 'No slots provided' })

    // Validate all dates are within next 14 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 14)

    for (const slot of slots) {
      const d = new Date(slot.date)
      if (d < today || d > maxDate) {
        return res.status(400).json({ message: `Date ${slot.date} must be within the next 14 days` })
      }
    }

    const created = await AppointmentSlot.insertMany(
      slots.map(s => ({
        professorId: req.user.id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        note: s.note || '',
      }))
    )

    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PROFESSOR: Get their own slots ──
exports.getMySlots = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const slots = await AppointmentSlot.find({
      professorId: req.user.id,
      date: { $gte: today },
    })
      .populate('bookedBy', 'name email program year')
      .sort({ date: 1, startTime: 1 })

    res.status(200).json(slots)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PROFESSOR: Delete a slot ──
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await AppointmentSlot.findById(req.params.id)
    if (!slot) return res.status(404).json({ message: 'Slot not found' })
    if (slot.professorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your slot' })
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot — cancel the booking first' })
    }
    await slot.deleteOne()
    res.status(200).json({ message: 'Slot deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── STUDENT: List all professors ──
exports.getProfessors = async (req, res) => {
  try {
    const { q } = req.query
    const query = { role: 'professor' }
    if (q) query.name = { $regex: q, $options: 'i' }

    const professors = await User.find(query)
      .select('name department avatarUrl')
      .sort({ name: 1 })

    res.status(200).json(professors)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── STUDENT: Get available slots for a professor ──
exports.getProfessorSlots = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const slots = await AppointmentSlot.find({
      professorId: req.params.professorId,
      date: { $gte: today },
      isBooked: false,
    })
      .sort({ date: 1, startTime: 1 })

    res.status(200).json(slots)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── STUDENT: Book a slot ──
exports.bookSlot = async (req, res) => {
  try {
    const slot = await AppointmentSlot.findById(req.params.slotId)
    if (!slot) return res.status(404).json({ message: 'Slot not found' })
    if (slot.isBooked) return res.status(400).json({ message: 'Slot already booked' })

    slot.isBooked = true
    slot.bookedBy = req.user.id
    await slot.save()

    await slot.populate('professorId', 'name department')
    await slot.populate('bookedBy', 'name')

    res.status(200).json(slot)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── STUDENT: Cancel booking ──
exports.cancelBooking = async (req, res) => {
  try {
    const slot = await AppointmentSlot.findById(req.params.slotId)
    if (!slot) return res.status(404).json({ message: 'Slot not found' })
    if (!slot.isBooked || slot.bookedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking' })
    }

    // Block cancellation less than 1 hour before
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}:00`)
    const diffMs = slotDateTime - new Date()
    if (diffMs < 60 * 60 * 1000) {
      return res.status(400).json({ message: 'Cannot cancel less than 1 hour before the appointment' })
    }

    slot.isBooked = false
    slot.bookedBy = null
    await slot.save()

    res.status(200).json({ message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── STUDENT: Get my bookings ──
exports.getMyBookings = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const bookings = await AppointmentSlot.find({
      bookedBy: req.user.id,
      date: { $gte: today },
    })
      .populate('professorId', 'name department avatarUrl')
      .sort({ date: 1, startTime: 1 })

    res.status(200).json(bookings)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}