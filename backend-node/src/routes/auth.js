// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'careflow_super_secret_jwt_key_987654321';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name, specialization } = req.body;
    
    if (!username || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (global.useMemoryDb) {
      const exists = global.memoryDb.users.find(u => u.username === username);
      if (exists) return res.status(400).json({ message: 'Username already exists' });
      
      const newUser = {
        _id: 'user_' + Date.now(),
        username,
        password: hashedPassword,
        role,
        name,
        specialization,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.memoryDb.users.push(newUser);
      
      const token = jwt.sign({ id: newUser._id, username, role, name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: newUser._id, username, role, name } });
    } else {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: 'Username already exists' });

      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        name,
        specialization
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, username, role, name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: newUser._id, username, role, name } });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let user;
    if (global.useMemoryDb) {
      user = global.memoryDb.users.find(u => u.username === username);
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        specialization: user.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctors
router.get('/doctors', async (req, res) => {
  try {
    if (global.useMemoryDb) {
      const doctors = global.memoryDb.users
        .filter(u => u.role === 'doctor')
        .map(u => ({ id: u._id, name: u.name, specialization: u.specialization }));
      return res.json(doctors);
    } else {
      const doctors = await User.find({ role: 'doctor', status: 'active' }).select('name specialization');
      return res.json(doctors);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (global.useMemoryDb) {
      const user = global.memoryDb.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ id: user._id, username: user.username, role: user.role, name: user.name, specialization: user.specialization });
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
