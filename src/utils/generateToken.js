const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Use a short expiry (e.g., 1d or 7d) for security
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = generateToken;