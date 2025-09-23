const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const MenuItem = sequelize.define('MenuItem', {
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
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'menu_items',
  timestamps: false,
});

module.exports = MenuItem;
