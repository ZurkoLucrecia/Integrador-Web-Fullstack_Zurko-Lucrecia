const pool = require('../config/database');

// Obtener materias asignadas a un profesor
const getProfesorMaterias = async (req, res) => {
    try {
        const { id } = req.params;
        const profesorId = parseInt(id);
        
        // Verificar si el usuario que solicita es el mismo profesor o un administrador
        const userId = req.user.id_usuario;
        const userRole = req.user.rol;
        
        if (userRole !== 'administrador' && userId !== profesorId) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso' 
            });
        }

        // Obtener materias asignadas a este profesor con conteo de estudiantes y fechas de cursada
        const [materias] = await pool.query(`
            SELECT m.id_materia, m.nombre, m.descripcion, m.id_carrera, m.id_profesor, 
                   m.cuatrimestre, m.anio_carrera, m.activo, c.nombre as nombre_carrera,
                   m.fecha_inicio_cursada, m.fecha_fin_cursada,
                   (SELECT COUNT(*) FROM inscripciones i WHERE i.id_materia = m.id_materia AND i.estado = 'cursando') as estudiantes_inscritos
            FROM materias m
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            WHERE m.id_profesor = ? AND m.activo = TRUE`,
            [profesorId]
        );

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            materias: materias
        });
    } catch (error) {
        console.error('Error al obtener materias del profesor:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// Asignar una materia a un profesor
const assignProfesorMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_materia } = req.body;
        const profesorId = parseInt(id);
        const materiaId = parseInt(id_materia);

        // Verificar si el profesor existe y es realmente un profesor
        const [profesores] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = "profesor" AND activo = TRUE',
            [profesorId]
        );

        if (profesores.length === 0) {
            return res.status(404).json({ 
                error: 'Profesor no encontrado' 
            });
        }

        // Verificar si la materia existe
        const [materias] = await pool.query(
            'SELECT id_materia FROM materias WHERE id_materia = ? AND activo = TRUE',
            [materiaId]
        );

        if (materias.length === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada' 
            });
        }

        // Asignar la materia al profesor
        const [result] = await pool.query(
            'UPDATE materias SET id_profesor = ? WHERE id_materia = ?',
            [profesorId, materiaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada' 
            });
        }

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Materia asignada exitosamente al profesor'
        });
    } catch (error) {
        console.error('Error al asignar materia al profesor:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// Remover una materia de un profesor
const removeProfesorMateria = async (req, res) => {
    try {
        const { id, materiaId } = req.params;
        const profesorId = parseInt(id);
        const materiaIdInt = parseInt(materiaId);

        // Verificar si el profesor existe y es realmente un profesor
        const [profesores] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = "profesor" AND activo = TRUE',
            [profesorId]
        );

        if (profesores.length === 0) {
            return res.status(404).json({ 
                error: 'Profesor no encontrado' 
            });
        }

        // Verificar si la materia existe y está asignada a este profesor
        const [materias] = await pool.query(
            'SELECT id_materia FROM materias WHERE id_materia = ? AND id_profesor = ? AND activo = TRUE',
            [materiaIdInt, profesorId]
        );

        if (materias.length === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada o no asignada a este profesor' 
            });
        }

        // Remover la asignación del profesor de la materia
        const [result] = await pool.query(
            'UPDATE materias SET id_profesor = NULL WHERE id_materia = ? AND id_profesor = ?',
            [materiaIdInt, profesorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada o no asignada a este profesor' 
            });
        }

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Materia desasignada exitosamente del profesor'
        });
    } catch (error) {
        console.error('Error al desasignar materia del profesor:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

module.exports = {
    getProfesorMaterias,
    assignProfesorMateria,
    removeProfesorMateria
};