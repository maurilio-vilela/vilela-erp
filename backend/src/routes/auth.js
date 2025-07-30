// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', verifyToken, authController.listUsers);
router.get('/me', verifyToken, authController.getUser);

module.exports = router;