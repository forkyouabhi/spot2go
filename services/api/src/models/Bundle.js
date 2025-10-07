const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Bundle = sequelize.define('Bundle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  placeId: {
    type: DataTypes.INTEGER,
    field: 'place_id',
    references: { model: 'places', key: 'id' }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  tableName: 'bundles',
  timestamps: false,
});

module.exports = Bundle;
