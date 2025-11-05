// services/api/src/models/Review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  placeId: {
    type: DataTypes.INTEGER,
    field: 'place_id',
    allowNull: false,
    references: { model: 'places', key: 'id' }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    field: 'booking_id',
    allowNull: false,
    unique: true, // A booking can only be reviewed once
    references: { model: 'bookings', key: 'id' }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Review;