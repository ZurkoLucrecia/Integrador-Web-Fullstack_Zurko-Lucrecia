const express = require('express');
const router = express.Router();
const inscripcionesController = require('../controllers/inscripciones.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Rutas para estudiantes
router.post('/', verificarToken, verificarRol('estudiante'), inscripcionesController.inscribirEstudiante);
router.get('/disponibles', verificarToken, verificarRol('estudiante'), inscripcionesController.obtenerMateriasDisponibles);
router.get('/', verificarToken, verificarRol('estudiante'), inscripcionesController.obtenerMateriasInscritas);
router.get('/calificaciones', verificarToken, verificarRol('estudiante'), inscripcionesController.obtenerCalificaciones); // NUEVO
router.delete('/:id_materia', verificarToken, verificarRol('estudiante'), inscripcionesController.cancelarInscripcion);

module.exports = router;