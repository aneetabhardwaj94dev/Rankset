// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Taaki hum JSON data handle kar sakein

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rankset Database Connected!"))
  .catch((err) => console.log("DB Connection Error: ", err));

const PORT = process.env.PORT || 5000;
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});