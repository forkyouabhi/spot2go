// FIX: Load environment variables at the absolute top of the application
require('dotenv').config();

const express = require('express');
const passport = require('passport');
const cors = require('cors');
require('./config/passport');
require('./models'); // Initializes Sequelize and syncs models

const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Mount all routes
app.use('/api', routes); // Using a /api prefix for all routes
app.use('/', routes); // Serve static files from the uploads directory
// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Spot2Go API running' }));

// 404 handler for routes not found
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Spot2Go API running on port ${PORT}`));