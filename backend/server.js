require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/pages', require('./routes/pages')); // Added back as per Claude's reminder
app.use('/api/upload', require('./routes/upload'));

// 4. Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('--- Environment Check ---');
  console.log('Cloudinary Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
});