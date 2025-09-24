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
  // ADDED: name field to store the user's full name from the signup form.
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
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = User;

