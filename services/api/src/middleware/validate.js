// services/api/src/middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: 'Validation Failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

module.exports = validate;