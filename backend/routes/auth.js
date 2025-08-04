const express = require('express');
const router = express.Router();
const { registerTelegramUser } = require('../controllers/AuthController');

router.post('/telegram-login', registerTelegramUser);

module.exports = router;
