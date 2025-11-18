// services/api/src/controllers/adminController.js
const { Place, User, Booking } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const totalPlaces = await Place.count();
    const pendingPlaces = await Place.count({ where: { status: 'pending' } });
    const totalUsers = await User.count({ where: { role: 'customer' } });
    const pendingOwners = await User.count({ where: { role: 'owner', status: 'pending_verification' } });

    res.json({
      totalPlaces,
      pendingPlaces,
      totalUsers,
      pendingOwners
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getPendingPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'owner', attributes: ['name', 'email', 'phone'] }],
      order: [['created_at', 'ASC']]
    });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending places' });
  }
};

const updatePlaceStatus = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const place = await Place.findByPk(placeId);
    if (!place) return res.status(404).json({ error: 'Place not found' });

    await place.update({ status });
    
    // Optional: Send email to owner here
    
    res.json({ message: `Place ${status} successfully`, place });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const getPendingOwners = async (req, res) => {
  try {
    const owners = await User.findAll({
      where: { 
        role: 'owner', 
        status: 'pending_verification' // Must match exact DB enum/string
      },
      attributes: ['id', 'name', 'email', 'phone', 'businessLocation', 'created_at'],
      order: [['created_at', 'ASC']]
    });
    res.json(owners);
  } catch (err) {
    console.error("Pending Owners Error:", err);
    res.status(500).json({ error: 'Failed to fetch pending owners' });
  }
};

const updateOwnerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'rejected'

    const owner = await User.findByPk(userId);
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    await owner.update({ status });

    // Optional: Send email to owner here

    res.json({ message: `Owner account updated to ${status}`, owner });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

module.exports = {
  getDashboardStats,
  getPendingPlaces,
  updatePlaceStatus,
  getPendingOwners,
  updateOwnerStatus
};