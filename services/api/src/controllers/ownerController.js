const { Place, MenuItem, Bundle } = require('../models');

const createPlace = async (req, res) => {
  try {
    const { name, type, description, amenities, location, reservable, reservableHours } = req.body;
    const ownerId = req.user.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required.' });
    }
    const imageUrls = req.files.map(file => file.path);
    let amenitiesArray = [];
    if (typeof amenities === 'string' && amenities) {
      amenitiesArray = amenities.split(',');
    } else if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    }
    let parsedLocation;
    try {
        if (location) parsedLocation = JSON.parse(location);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid location format.' });
    }
    const place = await Place.create({
      ownerId, name, type, description,
      amenities: amenitiesArray,
      location: parsedLocation,
      images: imageUrls,
      status: 'pending',
      reservable: reservable === 'true',
      reservableHours: reservable === 'true' && reservableHours ? JSON.parse(reservableHours) : null,
    });
    res.status(201).json({ message: 'Place submitted for approval!', place });
  } catch (err) {
    console.error('CRITICAL ERROR in createPlace controller:', err);
    res.status(500).json({ error: 'An internal server error occurred while creating the place.' });
  }
};

// NEW FUNCTION: To update a place and re-submit it for approval
const updateOwnerPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const ownerId = req.user.id;
    const { name, type, description, amenities, location, reservable, reservableHours } = req.body;

    const place = await Place.findOne({ where: { id: placeId, ownerId } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or you do not have permission to edit it.' });
    }

    // Handle new image uploads. If new images are sent, they replace the old ones.
    // If no new images are sent, the existing ones are kept.
    const newImageUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path) : place.images;

    let amenitiesArray = [];
    if (typeof amenities === 'string' && amenities) {
      amenitiesArray = amenities.split(',');
    } else if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    }

    let parsedLocation;
    try {
        if (location) parsedLocation = JSON.parse(location);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid location format.' });
    }

    // Update the place details and reset status to 'pending' for re-approval
    await place.update({
      name,
      type,
      description,
      amenities: amenitiesArray,
      location: parsedLocation,
      images: newImageUrls,
      reservable: reservable === 'true',
      reservableHours: reservable === 'true' && reservableHours ? JSON.parse(reservableHours) : null,
      status: 'pending', // Re-submit for approval
    });

    res.status(200).json({ message: 'Place updated and re-submitted for approval!', place });
  } catch (err) {
    console.error('CRITICAL ERROR in updateOwnerPlace controller:', err);
    res.status(500).json({ error: 'An internal server error occurred while updating the place.' });
  }
};

const getOwnerPlaces = async (req, res) => {
  try {
    const ownerPlaces = await Place.findAll({
      where: { ownerId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(ownerPlaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

const getOwnerPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const ownerId = req.user.id;
    const place = await Place.findOne({
      where: { id: placeId, ownerId },
      include: ['menuItems', 'bundles'],
    });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or not owned by you.' });
    }
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, price } = req.body;
    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or not owned by you.' });
    }
    const { MenuItem } = require('../models');
    const item = await MenuItem.create({ placeId, name, price });
    res.status(201).json({ message: 'Menu item added', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

const addBundle = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, price, items } = req.body;
    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or not owned by you.' });
    }
    const { Bundle } = require('../models');
    const bundle = await Bundle.create({ placeId, name, price });
    if (items && items.length > 0) {
      await bundle.addItems(items);
    }
    res.status(201).json({ message: 'Bundle added', bundle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add bundle' });
  }
};

module.exports = {
  createPlace,
  getOwnerPlaces,
  updateOwnerPlace,
  getOwnerPlaceById,
  addMenuItem,
  addBundle,
};