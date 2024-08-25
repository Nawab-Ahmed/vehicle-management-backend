const express = require('express');
const router = express.Router();
const { signIn, changePassword } = require('../controllers/authController');

// Sign-in route
router.post('/signin', signIn);

// Change password route
router.post('/change-password', changePassword);

module.exports = router;
