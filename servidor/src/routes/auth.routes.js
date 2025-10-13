const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
// router.post('/register', authController.register); // REMOVED - Users are created by admin only

// Rutas protegidas
router.get('/profile', verificarToken, authController.getProfile);

module.exports = router;