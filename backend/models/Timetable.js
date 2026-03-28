const mongoose = require('mongoose')

const timetableSchema = new mongoose.Schema(
  {
    programme:    { type: String, required: true },
    year:         { type: Number, required: true },
    semester:     { type: Number, required: true, enum: [1, 2] },
    academicYear: { type: String, required: true, default: '2025-2026' },
    mediaUrl:     { type: String, required: true },
    mediaPublicId:{ type: String, default: null },
    mediaType:    { type: String, default: 'image' },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// One timetable per programme + year + semester + academicYear
timetableSchema.index({ programme: 1, year: 1, semester: 1, academicYear: 1 }, { unique: true })

module.exports = mongoose.model('Timetable', timetableSchema)