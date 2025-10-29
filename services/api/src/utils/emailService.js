// services/api/src/utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure environment variables are loaded

// Configure the transporter using environment variables
// Example using generic SMTP - replace with your provider's details
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., 'smtp.example.com'
  port: process.env.EMAIL_PORT || 587, // e.g., 587 for TLS
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app-specific password
  },
  // Optional: Add TLS options if needed, e.g., for self-signed certs
  // tls: {
  //   rejectUnauthorized: false
  // }
});

// --- Basic Email Templates (Replace with better HTML templates later) ---
const emailTemplates = {
  bookingConfirmation: ({ name, placeName, date, startTime, endTime, ticketId }) => ({
    subject: `Booking Confirmed for ${placeName}!`,
    text: `Hi ${name},\n\nYour booking for ${placeName} is confirmed!\n\nDate: ${date}\nTime: ${startTime} - ${endTime}\nTicket ID: ${ticketId}\n\nSee you there!\nSpot2Go Team`,
    html: `<p>Hi ${name},</p><p>Your booking for <strong>${placeName}</strong> is confirmed!</p><ul><li>Date: ${date}</li><li>Time: ${startTime} - ${endTime}</li><li>Ticket ID: ${ticketId}</li></ul><p>See you there!<br/>Spot2Go Team</p>`,
  }),
  passwordResetRequest: ({ name, resetLink }) => ({
    subject: 'Reset Your Spot2Go Password',
    text: `Hi ${name},\n\nPlease click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\nIf you didn't request this, please ignore this email.\n\nSpot2Go Team`,
    html: `<p>Hi ${name},</p><p>Please click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you didn't request this, please ignore this email.</p><p>Spot2Go Team</p>`,
  }),
  // Optional: Password Reset Confirmation
   passwordResetConfirmation: ({ name }) => ({
    subject: 'Your Spot2Go Password Has Been Changed',
    text: `Hi ${name},\n\nYour password for Spot2Go has been successfully changed.\n\nIf you did not make this change, please contact support immediately.\n\nSpot2Go Team`,
    html: `<p>Hi ${name},</p><p>Your password for Spot2Go has been successfully changed.</p><p>If you did not make this change, please contact support immediately.</p><p>Spot2Go Team</p>`,
  }),
};

/**
 * Sends an email.
 * @param {string} to - Recipient email address.
 * @param {string} templateName - Name of the template to use ('bookingConfirmation', 'passwordResetRequest', etc.).
 * @param {object} data - Data to inject into the template.
 */
async function sendEmail(to, templateName, data) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_HOST) {
    console.error('Email credentials not configured in .env file. Skipping email.');
    // In development, you might want to just log instead of throwing an error
    // throw new Error('Email service not configured.');
    return;
  }

  if (!emailTemplates[templateName]) {
    console.error(`Email template "${templateName}" not found.`);
    throw new Error(`Email template "${templateName}" not found.`);
  }

  const { subject, text, html } = emailTemplates[templateName](data);

  const mailOptions = {
    from: `"Spot2Go" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.'); // Re-throw for controller to handle
  }
}

module.exports = { sendEmail };