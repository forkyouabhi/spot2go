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
  passwordResetToken: { // Keep fields added for password reset
    type: DataTypes.STRING,
    allowNull: true,
    field: 'password_reset_token',
  },
  passwordResetExpires: { // Keep fields added for password reset
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
    defaultValue: 'active', // Default for customers or already approved users
    allowNull: false,
    validate: {
      isIn: [['active', 'pending_verification', 'rejected']], // Possible statuses
    },
  },
  // --- ADDITIONS START ---
  // Explicitly define createdAt to ensure it's NOT NULL and uses DB default
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false, // Keep this false for new records
    defaultValue: DataTypes.NOW, // Rely on DB default
    field: 'created_at' // Explicitly map to the snake_case column name
  },
  // Explicitly define updatedAt and ALLOW NULLs for existing rows
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true, // <<<< This allows NULLs for existing rows
    field: 'updated_at' // Explicitly map to the snake_case column name
  }
  // --- ADDITIONS END ---
},
{
  tableName: 'users',
  timestamps: true, // Keep this true so Sequelize manages updates going forward
  createdAt: 'created_at', // Keep specifying the exact column name
  updatedAt: 'updated_at', // Keep specifying the exact column name
});

module.exports = User;