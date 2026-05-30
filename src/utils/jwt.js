const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

function generateToken(userId) {
  try {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    return token;
  } catch (error) {
    logger.error('Error generating JWT token', error);
    throw error;
  }
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Error verifying JWT token', error);
    throw error;
  }
}

function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Error decoding JWT token', error);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
