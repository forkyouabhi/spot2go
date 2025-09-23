const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const BundleItem = sequelize.define('BundleItem', {
  bundleId: {
    type: DataTypes.INTEGER,
    field: 'bundle_id',
    primaryKey: true,
    references: { model: 'bundles', key: 'id' }
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    field: 'menu_item_id',
    primaryKey: true,
    references: { model: 'menu_items', key: 'id' }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  }
}, {
  tableName: 'bundle_items',
  timestamps: false,
});

module.exports = BundleItem;
