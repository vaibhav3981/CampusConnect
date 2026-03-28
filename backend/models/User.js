const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor', 'alumni'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    verificationDoc: { type: String, default: null },

    // Student specific
    year:            { type: Number, default: null },
    program:         { type: String, default: null },
    enrolledCourses: { type: [String], default: [] },
    matricola:       { type: String, default: null, sparse: true }, // 6-digit unique student ID

    // Alumni specific
    graduationYear: { type: Number, default: null },
    degree:         { type: String, default: null },

    // Professor specific
    department: { type: String, default: null },

    // Common profile fields
    avatarUrl: { type: String, default: null },
    bio:       { type: String, default: '', maxlength: 200 },
    isPrivate: { type: Boolean, default: false },

    followers:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followingHashtags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Hashtag' }],
    followingPages:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)