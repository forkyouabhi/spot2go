const { Place, MenuItem, Bundle } = require('../models');

// Create a new place with a 'pending' status by default
const createPlace = async (req, res) => {
  try {
    const { name, type, amenities, location } = req.body;
    const ownerId = req.user.id;

    const place = await Place.create({
      ownerId,
      name,
      type,
      amenities,
      location,
      status: 'pending', // Default status
    });

    res.status(201).json({ message: 'Place created and awaiting approval', place });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create place' });
  }
};

// Get all places owned by the current user, including their status
const getOwnerPlaces = async (req, res) => {
  try {
    const ownerPlaces = await Place.findAll({
      where: { ownerId: req.user.id },
      include: ['menuItems', 'bundles'],
      order: [['created_at', 'DESC']],
    });
    res.json(ownerPlaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

// Add a menu item to a specific place
const addMenuItem = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, price, available } = req.body;

    // Verify the place exists and belongs to the owner
    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or you do not have permission.' });
    }

    const item = await MenuItem.create({
      placeId,
      name,
      price,
      available,
    });

    res.status(201).json({ message: 'Menu item added', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

// Add a bundle of items to a specific place
const addBundle = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, price, items } = req.body; // items is expected to be an array of menuItem IDs

    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or you do not have permission.' });
    }

    const bundle = await Bundle.create({
      placeId,
      name,
      price,
    });

    if (items && items.length > 0) {
      await bundle.addItems(items); // Sequelize magic method for many-to-many
    }

    res.status(201).json({ message: 'Bundle added', bundle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add bundle' });
  }
};

// IMPORTANT: Export all functions in a single object
module.exports = {
  createPlace,
  getOwnerPlaces,
  addMenuItem,
  addBundle,
};
