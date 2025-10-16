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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'pending', // pending, confirmed, cancelled
  },
  amount: {
    type: DataTypes.DECIMAL,
  },
  paymentId: {
    type: DataTypes.TEXT,
    field: 'payment_id',
  },
  ticketId: {
    type: DataTypes.TEXT,
    field: 'ticket_id',
    unique: true,
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Booking;

