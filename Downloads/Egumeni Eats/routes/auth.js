const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

const router = express.Router();

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, phone, privilegePin } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Create user
    const user = new User({ email, password, name, role, phone, privilegePin });
    await user.save();

    // Create profile
    const profile = new Profile({ userId: user._id, role: user.role, name: user.name, phone: user.phone });
    await profile.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      profile: profile.toJSON()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Fetch profile
    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      success: true,
      token,
      user: user.toJSON(),
      profile: profile ? profile.toJSON() : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/profile
router.get('/profile', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const profile = await Profile.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      success: true,
      user: user.toJSON(),
      profile: profile ? profile.toJSON() : null
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

module.exports = router;
module.exports.verifyJWT = verifyJWT;
