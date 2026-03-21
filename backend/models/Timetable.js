const mongoose = require('mongoose')

const timetableSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    moduleName: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    time: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,