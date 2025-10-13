const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materias.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', materiasController.obtenerMaterias);
router.get('/:id', materiasController.obtenerMateriaPorId);

// Rutas protegidas
router.post('/', verificarToken, verificarRol('administrador'), materiasController.crearMateria);
router.put('/:id', verificarToken, verificarRol('administrador'), materiasController.actualizarMateria);
router.delete('/:id', verificarToken, verificarRol('administrador'), materiasController.eliminarMateria);

module.exports = router;