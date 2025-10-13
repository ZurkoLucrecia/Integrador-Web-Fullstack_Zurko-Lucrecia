const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const usuariosController = require('../controllers/usuarios.controller');
const profesoresController = require('../controllers/profesores.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Rutas para administradores - Gestión de usuarios
router.get('/usuarios', verificarToken, verificarRol('administrador'), usuariosController.getUsuarios);
router.post('/usuarios', verificarToken, verificarRol('administrador'), usuariosController.createUsuario);
router.put('/usuarios/:id', verificarToken, verificarRol('administrador'), usuariosController.updateUsuario);
router.delete('/usuarios/:id', verificarToken, verificarRol('administrador'), usuariosController.deleteUsuario);

// Rutas para administradores - Gestión de profesores y materias
router.get('/profesores/:id/materias', verificarToken, verificarRol('administrador'), profesoresController.getProfesorMaterias);
router.post('/profesores/:id/materias', verificarToken, verificarRol('administrador'), profesoresController.assignProfesorMateria);
router.delete('/profesores/:id/materias/:materiaId', verificarToken, verificarRol('administrador'), profesoresController.removeProfesorMateria);

// Rutas para administradores - Gestión de períodos de inscripción
router.get('/carreras', verificarToken, verificarRol('administrador'), adminController.obtenerCarreras);
router.get('/carreras/:id_carrera/materias', verificarToken, verificarRol('administrador'), adminController.obtenerMateriasPorCarrera);
router.put('/materias/:id_materia/periodo-inscripcion', verificarToken, verificarRol('administrador'), adminController.actualizarPeriodoInscripcion);

// Rutas para administradores - Asignar carrera a usuarios
router.put('/usuarios/:id_usuario/carrera', verificarToken, verificarRol('administrador'), adminController.asignarCarreraAUsuario);

// Limpiar inscripciones y archivarlas
router.post('/materias/:id_materia/limpiar-inscripciones', verificarToken, verificarRol('administrador'), adminController.limpiarInscripciones);

// Obtener inscripciones archivadas
router.get('/materias/:id_materia/inscripciones-archivadas', verificarToken, verificarRol('administrador'), adminController.obtenerInscripcionesArchivadas);

module.exports = router;