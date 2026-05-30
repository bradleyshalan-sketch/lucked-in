const express = require('express');
const authService = require('../services/auth.service');
const { validateSignup, validateLogin } = require('../validators/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePassword123",
 *   "firstName": "John",
 *   "lastName": "Doe"
 * }
 */
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const { error, value } = validateSignup(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: error.details.map((detail) => detail.message),
      });
    }

    const result = await authService.signup(
      value.email,
      value.password,
      value.firstName,
      value.lastName
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user with email and password
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePassword123"
 * }
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { error, value } = validateLogin(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: error.details.map((detail) => detail.message),
      });
    }

    const result = await authService.login(value.email, value.password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: Bearer token in Authorization header
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/update
 * Update current user profile
 * Requires: Bearer token in Authorization header
 */
router.put('/update', authenticate, async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const updates = {};
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;

    const user = await authService.updateUser(req.user.userId, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
