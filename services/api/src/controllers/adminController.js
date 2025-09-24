const { Place } = require('../models');

// Fetch all places with a 'pending' status for review
const getPendingPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({ where: { status: 'pending' } });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending places' });
  }
};

// Update a place's status (e.g., to 'approved')
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
  getPendingPlaces,
  updatePlaceStatus,
};

