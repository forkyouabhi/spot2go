// services/api/src/models/index.js
const sequelize = require('../config/sequelize');
const User = require('./User');
const Place = require('./Place');
const MenuItem = require('./MenuItem');
const Bundle = require('./Bundle');
const BundleItem = require('./BundleItem');
const Booking = require('./Booking');
const UserDevice = require('./UserDevice');
const UserBookmark = require('./UserBookmark');
const Bookmark = require('./Bookmark');
const Review = require('./Review');

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

// --- 3. ADD NEW ASSOCIATIONS ---

// User <-> Place (Many-to-Many for Bookmarks)
User.belongsToMany(Place, {
  through: UserBookmark,
  foreignKey: 'userId',
  otherKey: 'placeId',
  as: 'bookmarkedPlaces'
});
Place.belongsToMany(User, {
  through: UserBookmark,
  foreignKey: 'placeId',
  otherKey: 'userId',
  as: 'bookmarkedBy'
});

// User -> Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Place -> Review (One-to-Many)
Place.hasMany(Review, { foreignKey: 'placeId', as: 'reviews' });
Review.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// --- END ADDITIONS ---

const db = {
  sequelize,
  User,
  Place,
  MenuItem,
  Bundle,
  BundleItem,
  Booking,
  UserDevice,
  UserBookmark,
  Bookmark,
  Review,       
};

// Sync all models with the database
sequelize.sync({ alter: true }).then(() => {
  console.log('All models were synchronized successfully.');
});

module.exports = db;