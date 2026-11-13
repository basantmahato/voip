const express = require('express');
const router = express.Router();
const { createGuest, registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/guest', createGuest);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);

module.exports = router;
