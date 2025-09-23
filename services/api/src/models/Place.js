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
  amenities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
  },
  location: {
    type: DataTypes.JSONB, // { lat, lng, address }
  },
}, {
  tableName: 'places',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Place;
