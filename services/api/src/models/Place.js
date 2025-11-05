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
  rating: {
    type: DataTypes.DECIMAL(2, 1), // e.g., 4.5
    defaultValue: 0.0
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    field: 'review_count',
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
  },
  images: {
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
  reservable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  reservableHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'reservable_hours',
  },
}, {
  tableName: 'places',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Place;