const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserDevice = sequelize.define('UserDevice', {
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
  fcmToken: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false,
    field: 'fcm_token',
  },
}, {
  tableName: 'user_devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = UserDevice;
