const { body } = require('express-validator');

// Rules for changing passwords
const changePasswordSchema = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .not().equals('password').withMessage('Password cannot be "password"'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  }),
];

// Rules for updating profile info
const updateProfileSchema = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name is too long')
    .escape(), // Sanitize HTML characters
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone().withMessage('Invalid phone number format'),
];

// Rules for notification preferences
const updateSettingsSchema = [
  body('notifications').isObject().withMessage('Invalid settings format'),
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('notifications.marketing').optional().isBoolean(),
];

module.exports = {
  changePasswordSchema,
  updateProfileSchema,
  updateSettingsSchema
};