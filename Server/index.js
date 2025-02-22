const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

connectDB();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Project Management Platform Backend');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});