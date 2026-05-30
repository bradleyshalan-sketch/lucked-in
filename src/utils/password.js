const bcrypt = require('bcryptjs');
const logger = require('./logger');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    logger.error('Error hashing password', error);
    throw error;
  }
}

async function comparePassword(password, hash) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing password', error);
    throw error;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
};
