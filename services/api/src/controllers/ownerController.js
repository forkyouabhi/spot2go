// services/api/src/controllers/ownerController.js
const { Place, Booking, User, MenuItem, Bundle } = require('../models');

const createPlace = async (req, res) => {
  try {
    console.log('--- Create Place Request Received ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files); // <--- DEBUG LOG

    const { name, type, description, amenities, location, reservable, reservableHours, maxCapacity } = req.body;
    const ownerId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required.' });
    }

    // FIX: Robustly extract URL from various possible properties
    const imageUrls = req.files.map(file => file.path || file.secure_url || file.url);

    console.log('Extracted Image URLs:', imageUrls); // <--- DEBUG LOG

    let amenitiesArray = [];
    if (typeof amenities === 'string' && amenities) {
      amenitiesArray = amenities.split(',').map(s => s.trim()); // Trim whitespace
    } else if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    }

    let parsedLocation;
    try {
        if (location) {
           // Handle double-stringified JSON if it happens
           parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        }
    } catch (e) {
        console.error("Location Parse Error:", e);
        return res.status(400).json({ error: 'Invalid location format.' });
    }

    const place = await Place.create({
      ownerId, 
      name, 
      type, 
      description,
      amenities: amenitiesArray,
      location: parsedLocation,
      images: imageUrls, // Save the array of strings
      status: 'pending',
      reservable: reservable === 'true',
      reservableHours: reservable === 'true' && reservableHours ? JSON.parse(reservableHours) : null,
      maxCapacity: reservable === 'true' && maxCapacity ? parseInt(maxCapacity, 10) : 1,
    });

    console.log('Place Created in DB:', place.toJSON()); // <--- DEBUG LOG

    res.status(201).json({ message: 'Place submitted for approval!', place });
  } catch (err) {
    console.error('CRITICAL ERROR in createPlace controller:', err);
    res.status(500).json({ error: 'An internal server error occurred while creating the place.' });
  }
};

const updateOwnerPlace = async (req, res) => {
  try {
    console.log('--- Update Place Request ---');
    const { placeId } = req.params;
    const ownerId = req.user.id;
    const { name, type, description, amenities, location, reservable, reservableHours, maxCapacity } = req.body;

    const place = await Place.findOne({ where: { id: placeId, ownerId } });
    if (!place) {
      return res.status(404).json({ error: 'Place not found or you do not have permission to edit it.' });
    }

    // FIX: Handle new files OR keep existing images
    let newImageUrls = place.images;
    if (req.files && req.files.length > 0) {
       newImageUrls = req.files.map(file => file.path || file.secure_url || file.url);
    }

    let amenitiesArray = [];
    if (typeof amenities === 'string' && amenities) {
      amenitiesArray = amenities.split(',').map(s => s.trim());
    } else if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    }

    let parsedLocation;
    try {
        if (location) {
            parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        }
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
      maxCapacity: reservable === 'true' && maxCapacity ? parseInt(maxCapacity, 10) : 1,
      status: 'pending', 
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
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: { model: Place, as: 'place', attributes: ['ownerId'] }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.place.ownerId !== ownerId) return res.status(403).json({ error: 'Forbidden.' });

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking marked as ${status}.`, booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

const checkInByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ownerId = req.user.id;

    if (!ticketId) return res.status(400).json({ error: 'Ticket ID is required.' });

    const booking = await Booking.findOne({
      where: { ticketId },
      include: { model: Place, as: 'place', attributes: ['ownerId', 'name'] }
    });

    if (!booking) return res.status(404).json({ error: 'Invalid Ticket.' });
    if (booking.place.ownerId !== ownerId) return res.status(403).json({ error: 'Forbidden.' });
    if (booking.status === 'completed') return res.status(400).json({ error: 'Already checked in.' });

    booking.status = 'completed';
    await booking.save();

    const updatedBooking = await Booking.findByPk(booking.id, {
        include: [
            { model: Place, as: 'place', attributes: ['name'] },
            { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
        ]
    });

    res.json({ message: 'Check-in successful!', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed.' });
  }
};

const addMenuItem = async (req, res) => {
  // ... (unchanged)
  try {
    const { placeId } = req.params;
    const { name, price } = req.body;
    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const item = await MenuItem.create({ placeId, name, price });
    res.status(201).json({ message: 'Item added', item });
  } catch (err) { res.status(500).json({ error: 'Error adding item' }); }
};

const addBundle = async (req, res) => {
   // ... (unchanged)
   try {
    const { placeId } = req.params;
    const { name, price, items } = req.body;
    const place = await Place.findOne({ where: { id: placeId, ownerId: req.user.id } });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const bundle = await Bundle.create({ placeId, name, price });
    if (items && items.length > 0) await bundle.addItems(items);
    res.status(201).json({ message: 'Bundle added', bundle });
  } catch (err) { res.status(500).json({ error: 'Error adding bundle' }); }
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