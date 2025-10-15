const Materia = require('../models/materias.model');

// Obtener todas las materias
const obtenerMaterias = async (req, res) => {
    try {
        const { id_carrera, id_profesor, cuatrimestre, anio_carrera } = req.query;
        const filtros = {};
        
        if (id_carrera) filtros.id_carrera = id_carrera;
        if (id_profesor) filtros.id_profesor = id_profesor;
        if (cuatrimestre) filtros.cuatrimestre = cuatrimestre;
        if (anio_carrera) filtros.anio_carrera = anio_carrera;

        const db = req.app.get('db');
        const materias = await Materia.obtenerTodas(db, filtros);
        
        // Asegurar codificación UTF-8 
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(materias);

    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ 
            error: 'Error al obtener materias.' 
        });
    }
};

// Obtener una materia por ID
const obtenerMateriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.app.get('db');
        
        const materia = await Materia.obtenerPorId(db, id);

        if (!materia) {
            return res.status(404).json({ 
                error: 'Materia no encontrada.' 
            });
        }

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(materia);

    } catch (error) {
        console.error('Error al obtener materia:', error);
        res.status(500).json({ 
            error: 'Error al obtener materia.' 
        });
    }
};

// Crear materia
const crearMateria = async (req, res) => {
    try {
        const db = req.app.get('db');
        const id_materia = await Materia.crear(db, req.body);

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.status(201).json({
            mensaje: 'Materia creada exitosamente.',
            id_materia: id_materia
        });

    } catch (error) {
        console.error('Error al crear materia:', error);
        res.status(500).json({ 
            error: 'Error al crear materia.' 
        });
    }
};

// Actualizar materia
const actualizarMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.app.get('db');
        
        const actualizado = await Materia.actualizar(db, id, req.body);

        if (!actualizado) {
            return res.status(404).json({ 
                error: 'Materia no encontrada.' 
            });
        }

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({ mensaje: 'Materia actualizada exitosamente.' });

    } catch (error) {
        console.error('Error al actualizar materia:', error);
        res.status(500).json({ 
            error: 'Error al actualizar materia.' 
        });
    }
};

// Eliminar materia 
const eliminarMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.app.get('db');
        
        const eliminado = await Materia.eliminar(db, id);

        if (!eliminado) {
            return res.status(404).json({ 
                error: 'Materia no encontrada.' 
            });
        }

        // Asegurar codificación UTF-8 de nuevo ajs
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({ mensaje: 'Materia eliminada exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar materia:', error);
        res.status(500).json({ 
            error: 'Error al eliminar materia.' 
        });
    }
};

module.exports = {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    eliminarMateria
};