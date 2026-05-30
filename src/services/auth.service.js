const { supabase, supabaseAdmin } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Sign up a new user with email and password
 * Creates user with FREE tier by default
 */
async function signup(email, password, firstName, lastName) {
  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      logger.error('Error creating auth user:', authError);
      throw new Error('Failed to create user');
    }

    const userId = authData.user.id;

    // Create user in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          tier: 'FREE',
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (userError) {
      logger.error('Error creating user record:', userError);
      throw new Error('Failed to create user record');
    }

    // Generate JWT token
    const token = generateToken(userId);

    logger.info(`New user signed up: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        tier: user.tier,
      },
      token,
    };
  } catch (error) {
    logger.error('Signup error:', error);
    throw error;
  }
}

/**
 * Login user with email and password
 */
async function login(email, password) {
  try {
    // Get user from database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, tier')
      .eq('email', email)
      .single();

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        tier: user.tier,
      },
      token,
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, tier, created_at')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateUser(userId, updates) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`User updated: ${userId}`);

    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
}

module.exports = {
  signup,
  login,
  getUserById,
  updateUser,
};
