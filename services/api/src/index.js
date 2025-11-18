// services/api/src/index.js
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <--- IMPORT THIS
const path = require('path');

require('./config/passport');
require('./models'); 

const routes = require('./routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // <--- ADD THIS HERE
app.use(passport.initialize());

app.use('/api', routes); 
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Spot2Go API running' }));

app.use((req, res, next) => {
  console.log(`404 Error: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Spot2Go API running on http://localhost:${PORT}`));