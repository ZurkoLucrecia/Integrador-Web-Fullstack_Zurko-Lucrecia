const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener perfil del usuario actual
router.get('/', perfilController.obtenerPerfil);

// Actualizar perfil del usuario actual
router.put('/', perfilController.actualizarPerfil);

// Cambiar contraseña del usuario actual
router.put('/cambiar-password', perfilController.cambiarPassword);

module.exports = router;