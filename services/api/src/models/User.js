const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: true, // Allow null for social logins that don't provide email
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true, // Allow null for non-local auth
  },
  role: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['customer', 'owner']],
    },
  },
  provider: {
    type: DataTypes.TEXT,
    defaultValue: 'local',
  },
  providerId: {
    type: DataTypes.TEXT,
    field: 'provider_id',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Assuming you don't have an updated_at column
});

module.exports = User;
