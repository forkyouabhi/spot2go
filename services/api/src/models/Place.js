const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Place = sequelize.define('Place', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.TEXT, // e.g., cafe, library, coworking
  },
  description: { // ADDED description field
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
  },
  images: { // ADDED images field
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  location: {
    type: DataTypes.JSONB, // { lat, lng, address }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // 'pending', 'approved', 'rejected'
    allowNull: false,
  },
}, {
  tableName: 'places',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Place;