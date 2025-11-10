// services/api/src/controllers/adminController.js
const { Place, User, MenuItem } = require('../models');
const { sendEmail } = require('../utils/emailService');

const getPlaceStats = async (req, res) => {
  try {
    const totalPlaces = await Place.count();
    const approvedPlaces = await Place.count({ where: { status: 'approved' } });
    const pendingPlaces = await Place.count({ where: { status: 'pending' } });
    const pendingOwners = await User.count({ where: { role: 'owner', status: 'pending_verification' } });

    res.json({
      places: {
        total: totalPlaces,
        approved: approvedPlaces,
        pending: pendingPlaces,
      },
      owners: {
        pending: pendingOwners
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

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


// Get users pending verification
const getPendingOwners = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: {
        role: 'owner',
        status: 'pending_verification'
      },
      // --- FIX: Use aliasing for 'createdAt' and 'businessLocation' ---
      attributes: [
        'id', 
        'name', 
        'email', 
        ['created_at', 'createdAt'], // Map DB column 'created_at' to 'createdAt' in the result
        'phone', 
        ['business_location', 'businessLocation'] // Map DB column 'business_location'
      ],
      order: [['created_at', 'ASC']], // Order by the actual DB column name
      // --- END FIX ---
    });
    res.json(pendingUsers);
  } catch (err) {
    console.error('Error fetching pending owners:', err);
    res.status(500).json({ error: 'Failed to fetch pending owners' });
  }
};


const updateOwnerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // Expecting 'active' or 'rejected'

  if (!['active', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided. Use "active" or "rejected".' });
  }

  try {
    const user = await User.findOne({
      where: {
        id: userId,
        role: 'owner'
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Owner user not found.' });
    }

    if (user.status === status) {
        return res.json({ message: `Owner status is already ${status}.`, user });
    }

    user.status = status;
    await user.save();

    const emailTemplate = status === 'active' ? 'ownerAccountApproved' : 'ownerAccountRejected';
    try {
        await sendEmail(user.email, emailTemplate, {
            name: user.name,
        });
    } catch (emailError) {
        console.error(`Failed to send owner status update email to ${user.email}:`, emailError);
    }

    res.json({ message: `Owner status updated to ${status}.`, user });

  } catch (err) {
    console.error('Error updating owner status:', err);
    res.status(500).json({ error: 'Failed to update owner status.' });
  }
};


module.exports = {
  getPlaceStats,
  getPendingPlaces,
  updatePlaceStatus,
  getPendingOwners,
  updateOwnerStatus,
};