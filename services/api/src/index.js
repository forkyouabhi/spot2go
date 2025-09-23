const express = require('express');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
require('./config/passport');
require('./models'); // <-- ADD THIS LINE to initialize Sequelize and sync models

const routes = require('./routes'); // central aggregator

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Mount all routes
app.use('/', routes);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Spot2Go API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - This is the corrected line
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Spot2Go API running on port ${PORT}`));

