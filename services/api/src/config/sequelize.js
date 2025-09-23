const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with the database URL from your environment variables
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
  logging: false, // Set to true to see SQL queries in console
});

// Test the database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

connectDB();

module.exports = sequelize;
