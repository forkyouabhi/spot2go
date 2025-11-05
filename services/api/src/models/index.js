// Replace the entire contents of this file

const sequelize = require('../config/sequelize');
const User = require('./User');
const Place = require('./Place');
const MenuItem = require('./MenuItem');
const Bundle = require('./Bundle');
const BundleItem = require('./BundleItem');
const Booking = require('./Booking');
const UserDevice = require('./UserDevice');
const Bookmark = require('./Bookmark'); // <-- ADDED

// Define associations

// User -> Place (One-to-Many)
User.hasMany(Place, { foreignKey: 'ownerId', as: 'places' });
Place.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User -> Booking (One-to-Many)
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> UserDevice (One-to-Many)
User.hasMany(UserDevice, { foreignKey: 'userId', as: 'devices' });
UserDevice.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Place -> MenuItem (One-to-Many)
Place.hasMany(MenuItem, { foreignKey: 'placeId', as: 'menuItems' });
MenuItem.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// Place -> Bundle (One-to-Many)
Place.hasMany(Bundle, { foreignKey: 'placeId', as: 'bundles' });
Bundle.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// Place -> Booking (One-to-Many)
Place.hasMany(Booking, { foreignKey: 'placeId', as: 'bookings' });
Booking.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// Bundle <-> MenuItem (Many-to-Many)
Bundle.belongsToMany(MenuItem, { through: BundleItem, foreignKey: 'bundleId', as: 'items' });
MenuItem.belongsToMany(Bundle, { through: BundleItem, foreignKey: 'menuItemId', as: 'bundles' });

// --- ADDED BOOKMARK ASSOCIATIONS ---
User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });

Place.hasMany(Bookmark, { foreignKey: 'placeId', as: 'bookmarkedBy' });
Bookmark.belongsTo(Place, { foreignKey: 'placeId' });
// --- END BOOKMARK ASSOCIATIONS ---

const db = {
  sequelize,
  User,
  Place,
  MenuItem,
  Bundle,
  BundleItem,
  Booking,
  UserDevice,
  Bookmark, // <-- ADDED
};

// Sync all models with the database
// In a real production app, you might use migrations instead of sync()
sequelize.sync({ alter: true }).then(() => {
  console.log('All models were synchronized successfully.');
});

module.exports = db;