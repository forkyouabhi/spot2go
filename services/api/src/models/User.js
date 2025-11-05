// services/api/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role: {
    type: DataTypes.TEXT,
    defaultValue: 'customer',
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'active',
  },
  provider: {
    type: DataTypes.TEXT,
  },
  providerId: {
    type: DataTypes.TEXT,
    field: 'provider_id',
  },
  avatar: {
    type: DataTypes.TEXT,
  },
  phone: {
    type: DataTypes.TEXT,
  },
  businessLocation: {
    type: DataTypes.TEXT,
    field: 'business_location',
  },
  passwordResetToken: {
    type: DataTypes.TEXT,
    field: 'password_reset_token',
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    field: 'password_reset_expires',
  },
  // --- NEW FIELDS FOR OTP VERIFICATION ---
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'email_verified',
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    field: 'email_verification_token',
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    field: 'email_verification_expires',
  },
  // --- END NEW FIELDS ---
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.comparePassword = function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;