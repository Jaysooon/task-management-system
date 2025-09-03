const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const authenticateToken = require('../middleware/auth');

// GET /registrations
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Only admins can view registrations
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const registrations = await Registration.find();
    console.log(`📋 Returning ${registrations.length} pending registrations`);
    res.json(registrations);
  } catch (err) {
    console.error('Failed to fetch registrations:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Create new registration (public route)
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Check if registration already exists
    const existingReg = await Registration.findOne({ email: email.toLowerCase().trim() });
    if (existingReg) {
      return res.status(409).json({ error: 'Registration already pending for this email' });
    }

    // Store password in plain text temporarily (will be hashed during approval)
    const hashed = await bcrypt.hash(password, 12);
    const registration = new Registration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed, 
      status: 'pending',
      createdAt: new Date(),
    });
    
    await registration.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration submitted successfully. Please wait for admin approval.',
      registration: {
        _id: registration._id,
        name: registration.name,
        email: registration.email,
        status: registration.status,
        createdAt: registration.createdAt
      }
    });
  } catch (err) {
    console.error('Failed to create registration:', err);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

// Approve registration -> create user (protected route)
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    // Only admins can approve registrations
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const reg = await Registration.findById(req.params.id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const { role = 'developer' } = req.body;
    
    // Validate role
    const validRoles = ['admin', 'product_owner', 'developer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Create the user
    const user = new User({
      name: reg.name,
      email: reg.email.toLowerCase(),
      password: reg.password,
      role,
      createdAt: new Date()
    });
    
    await user.save();
    
    // Delete the registration request
    await Registration.findByIdAndDelete(req.params.id);

    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error('Failed to approve registration:', err);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// Decline registration -> delete (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admins can decline registrations
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json({ success: true, message: 'Registration declined successfully' });
  } catch (err) {
    console.error('Failed to delete registration:', err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

module.exports = router;