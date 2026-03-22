require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Check this path!

// Route Imports
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');

const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));