const mongoose = require('mongoose')

const appointmentSlotSchema = new mongoose.Schema(
  {
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:        { type: String, required: true }, // 'YYYY-MM-DD'
    startTime:   { type: String, required: true }, // 'HH:MM'
    endTime:     { type: String, required: true }, // 'HH:MM'
    note:        { type: String, default: '' },
    isBooked:    { type: Boolean, default: false },
    bookedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

// Auto-expire slots — TTL index on a computed datetime field
appointmentSlotSchema.index({ date: 1, startTime: 1 })

module.exports = mongoose.model('AppointmentSlot', appointmentSlotSchema)