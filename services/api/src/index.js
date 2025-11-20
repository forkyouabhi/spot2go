// services/api/src/index.js
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');

require('./config/passport');
require('./models'); 

const routes = require('./routes');

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Dynamic CORS Setup
const allowedOrigins = [
  'http://localhost:3000', 
  'https://www.spot2go.app', 
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// 5. Body Parsing & Sanitization
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    req.rawBody = buf; // Needed for Stripe Webhook signature verification
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(hpp()); // Prevent Http Parameter Pollution

// 6. Auth Initialization
app.use(passport.initialize());

// 7. Routes
app.use('/api', routes); 
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 8. Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'Spot2Go API stable' }));

// 9. Centralized 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl 
  });
});

// 10. Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS prohibited' });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Spot2Go API secure & running on http://localhost:${PORT}`));