const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:userId', protect, getMessages);

module.exports = router;
