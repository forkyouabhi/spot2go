// services/api/src/models/UserBookmark.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserBookmark = sequelize.define('UserBookmark', {
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
    primaryKey: true,
  },
  placeId: {
    type: DataTypes.INTEGER,
    field: 'place_id',
    references: { model: 'places', key: 'id' },
    primaryKey: true,
  },
}, {
  tableName: 'user_bookmarks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // We only care when it was created
});

module.exports = UserBookmark;