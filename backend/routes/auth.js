const express = require('express');
const { authenticate, registerUser } = require('../controllers/authController');

const router = express.Router();

router.post('/login', authenticate);
router.post('/register', registerUser);

module.exports = router;
