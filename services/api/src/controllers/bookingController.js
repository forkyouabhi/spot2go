const { Booking, Place } = require('../models');
const ics = require('ics');

const generateCalendarFile = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [{ model: Place, as: 'place' }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const { place } = booking;
    const [year, month, day] = booking.date.split('-').map(Number);
    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    const [endHour, endMinute] = booking.endTime.split(':').map(Number);

    const event = {
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      title: `Booking at ${place.name}`,
      description: `Your Spot2Go booking for ${place.name}. Ticket ID: ${booking.ticketId}`,
      location: place.location.address,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/places/${place.id}`,
      status: 'CONFIRMED',
      organizer: { name: 'Spot2Go', email: 'noreply@spot2go.app' },
    };

    const { error, value } = ics.createEvent(event);

    if (error) {
      throw error;
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.ticketId}.ics"`);
    res.send(value);

  } catch (error) {
    console.error('Failed to generate .ics file:', error);
    res.status(500).json({ error: 'Could not generate calendar file.' });
  }
};

module.exports = {
  generateCalendarFile,
};

