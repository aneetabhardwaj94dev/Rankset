const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Naya line
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 1. API Routes (Purane wale)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// 2. Frontend Files Serve Karna (Naya logic)
// Ye line backend ko batati hai ki 'dist' folder mein website rakhi hai
const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "/frontend/dist")));

// 3. Agar koi anjaan link khole, toh use index.html par bhejein
app.get('*', (req, res) => {
  res.sendFile(path.join(_dirname, "frontend", "dist", "index.html"));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rankset Database Connected!"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));