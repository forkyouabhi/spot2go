const { Place, User, MenuItem } = require('../models');

// NEW FUNCTION: Get statistics about all places
const getPlaceStats = async (req, res) => {
  try {
    const totalPlaces = await Place.count();
    const approvedPlaces = await Place.count({ where: { status: 'approved' } });
    const pendingPlaces = await Place.count({ where: { status: 'pending' } });

    res.json({
      total: totalPlaces,
      approved: approvedPlaces,
      pending: pendingPlaces,
    });
  } catch (err) {
    console.error('Error fetching place stats:', err);
    res.status(500).json({ error: 'Failed to fetch place statistics' });
  }
};

// Fetch all places with a 'pending' status for review
const getPendingPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'owner', attributes: ['name', 'email'] },
        { model: MenuItem, as: 'menuItems', attributes: ['name', 'price'] },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending places' });
  }
};

// Update a place's status
const updatePlaceStatus = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    place.status = status;
    await place.save();
    res.json({ message: `Place status updated to ${status}`, place });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update place status' });
  }
};

module.exports = {
  getPlaceStats, // Export the new function
  getPendingPlaces,
  updatePlaceStatus,
};