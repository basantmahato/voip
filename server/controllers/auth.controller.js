const { randomUUID } = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Create a passwordless guest session
// @route   POST /api/auth/guest
// @access  Public
const createGuest = async (req, res) => {
  try {
    const displayName = typeof req.body?.displayName === 'string'
      ? req.body.displayName.trim()
      : '';

    if (!displayName || displayName.length > 32) {
      return res.status(400).json({ message: 'Enter a name between 1 and 32 characters' });
    }

    const user = await User.create({
      username: `guest_${randomUUID()}`,
      displayName,
      isGuest: true,
    });

    res.status(201).json({
      _id: user.id,
      displayName: user.displayName,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not start guest session' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getMe = async (req, res) => {
  // req.user is set by the auth middleware
  res.status(200).json(req.user);
};

module.exports = {
  createGuest,
  registerUser,
  loginUser,
  getMe,
};
