// services/api/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phone: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: true, // For social logins that might not provide an email
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true, // For social logins
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'password_reset_token',
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_expires',
  },
  role: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['customer', 'owner', 'admin']],
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
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['active', 'pending_verification', 'rejected']],
    },
    defaultValue: 'active', // Default is active, will be overridden by controller for owners
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false, // Keep false for new records
    defaultValue: DataTypes.NOW, // Rely on DB default
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true, // Allow NULLs for existing rows that might not have it
    field: 'updated_at'
  }
},
{
  tableName: 'users',
  timestamps: true, // Sequelize manages updates
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;