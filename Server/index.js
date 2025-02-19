const express = require('express');
const cors = require('cors');
const { default: connectDB } = require('./config/db');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Project Management Platform Backend');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});