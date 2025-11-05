// services/api/src/models/Bookmark.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Bookmark = sequelize.define('Bookmark', {
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    primaryKey: true,
    references: { model: 'users', key: 'id' }
  },
  placeId: {
    type: DataTypes.INTEGER,
    field: 'place_id',
    primaryKey: true,
    references: { model: 'places', key: 'id' }
  }
}, {
  tableName: 'bookmarks',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Bookmark;