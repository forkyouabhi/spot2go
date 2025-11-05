// services/api/src/models/Booking.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: { model: 'users', key: 'id' }
  },
  placeId: {
    type: DataTypes.INTEGER,
    field: 'place_id',
    references: { model: 'places', key: 'id' }
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'confirmed', // 'confirmed' (new), 'completed' (checked-in), 'cancelled'
    allowNull: false,
    validate: {
      isIn: [['confirmed', 'completed', 'cancelled', 'no-show']],
    },
  },
  amount: {
    type: DataTypes.DECIMAL,
  },
  paymentId: {
    type: DataTypes.TEXT,
    field: 'payment_id',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'startTime'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'endTime'
  },
  ticketId: {
    type: DataTypes.TEXT,
    unique: true,
    field: 'ticketId'
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Booking;