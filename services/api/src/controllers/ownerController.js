// services/api/src/controllers/ownerController.js
const { Place, MenuItem, Bundle, Booking, User } = require('../models');

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

const updateOwnerPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const ownerId = req.user.id;
    const { name, type, description, amenities, location, reservable, reservableHours } = req.body;

    const place = await Place.findOne({ where: { id: placeId, ownerId } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or you do not have permission to edit it.' });
    }

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

const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Place,
          as: 'place',
          where: { ownerId: ownerId }, 
          attributes: ['name']
        },
        {
          model: User,
          as: 'user',
          // --- THIS IS THE FIX ---
          // Add 'phone' to the attributes
          attributes: ['name', 'email', 'phone'] 
        }
      ],
      order: [['date', 'DESC'], ['startTime', 'ASC']]
    });

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching owner bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;

    if (!['completed', 'no-show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "completed" or "no-show".' });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: {
        model: Place,
        as: 'place',
        attributes: ['ownerId']
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.place.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Forbidden. You do not own the place for this booking.' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: `Cannot update booking with status "${booking.status}".` });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findByPk(bookingId, {
      include: [
        { model: Place, as: 'place', attributes: ['name'] },
        // --- ALSO FIX IT HERE ---
        // Make sure the returned object also has the phone
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] } 
      ]
    });

    res.json({ message: `Booking marked as ${status}.`, booking: updatedBooking });

  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
};
const checkInByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ownerId = req.user.id;

    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required.' });
    }

    const booking = await Booking.findOne({
      where: { ticketId },
      include: {
        model: Place,
        as: 'place',
        attributes: ['ownerId', 'name']
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Invalid Ticket: Booking not found.' });
    }

    // Security Check: Ensure the owner scanning this ticket actually owns the place
    if (booking.place.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Forbidden. This booking is for a place you do not own.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: `This customer has already been checked in.` });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: `Cannot check in a booking with status "${booking.status}".` });
    }

    // Success! Mark as completed.
    booking.status = 'completed';
    await booking.save();

    res.json({ 
      message: 'Check-in successful!',
      booking: {
        placeName: booking.place.name,
        date: booking.date,
        startTime: booking.startTime
      }
    });

  } catch (err) {
    console.error('Error checking in by ticket ID:', err);
    res.status(500).json({ error: 'Failed to check in booking.' });
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
  getOwnerBookings,
  updateBookingStatus,
  checkInByTicketId,
  addMenuItem,
  addBundle,
};