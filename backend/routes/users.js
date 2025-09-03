// routes/users.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'dev';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const authenticateToken = require('../middleware/auth');

// Helper function to create JWT token
const createToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    };
    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        return token;
    } catch (error) {
        console.error('Token creation failed:', error);
        throw error;
    };
};


// Helper function to hash password
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// AUTHENTICATION ROUTES

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = createToken(user);

        // Return user data (without password) and token
        const userResponse = {
            _id: user._id,
            id: user._id, // Include both for compatibility
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            user: userResponse,
            token,
            expiresIn: JWT_EXPIRY
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Register route (for admin to create users)
router.post('/register', authenticateToken, async (req, res) => {
    try {
        const { name, email, password, role = 'developer' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            createdAt: new Date()
        });

        await user.save();

        // Return user data (without password)
        const userResponse = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Verify token route (for frontend to check if token is still valid)
router.post('/verify-token', authenticateToken, async (req, res) => {
    try {
        // If we get here, the token is valid (middleware checked it)
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CRUD ROUTES (Protected)
// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        const usersResponse = users.map(user => ({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));
        res.json(usersResponse);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;