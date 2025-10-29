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
    defaultValue: 'active', // Default for customers or already approved users
    allowNull: false,
    validate: {
      isIn: [['active', 'pending_verification', 'rejected']], // Possible statuses
    },
  },
  // REMOVED explicit createdAt and updatedAt definitions from here
},
{
  tableName: 'users',
  timestamps: true, // Keep this true so Sequelize manages updates
  
  // --- MODIFICATION ---
  // Define the timestamp columns here to override defaults
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true, // 
    field: 'updated_at'
  }
  // --- END MODIFICATION ---
});

module.exports = User;