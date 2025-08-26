const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// @route     GET api/users
// @desc      Get all users (for testing/admin)
// @access    Public (vous pouvez ajouter auth plus tard)
router.get('/', async (req, res) => {
  try {
    // Récupère tous les utilisateurs sans les mots de passe
    const users = await User.find().select('-password').sort({ date: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route     GET api/users/:id
// @desc      Get single user by ID
// @access    Public (vous pouvez ajouter auth plus tard)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  '/',
  check('name', 'Please add name').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
