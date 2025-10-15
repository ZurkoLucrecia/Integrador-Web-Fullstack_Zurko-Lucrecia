const pool = require('../config/database');

// Get materias assigned to a professor
const getProfesorMaterias = async (req, res) => {
    try {
        const { id } = req.params;
        const profesorId = parseInt(id);
        
        // Check if the requesting user is the same professor or an administrator
        const userId = req.user.id_usuario;
        const userRole = req.user.rol;
        
        if (userRole !== 'administrador' && userId !== profesorId) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso' 
            });
        }

        // Get materias assigned to this professor with student count and cursada dates
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

        // Ensure proper UTF-8 encoding
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

// Assign a materia to a professor
const assignProfesorMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_materia } = req.body;
        const profesorId = parseInt(id);
        const materiaId = parseInt(id_materia);

        // Check if the professor exists and is actually a professor
        const [profesores] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = "profesor" AND activo = TRUE',
            [profesorId]
        );

        if (profesores.length === 0) {
            return res.status(404).json({ 
                error: 'Profesor no encontrado' 
            });
        }

        // Check if the materia exists
        const [materias] = await pool.query(
            'SELECT id_materia FROM materias WHERE id_materia = ? AND activo = TRUE',
            [materiaId]
        );

        if (materias.length === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada' 
            });
        }

        // Assign the materia to the professor
        const [result] = await pool.query(
            'UPDATE materias SET id_profesor = ? WHERE id_materia = ?',
            [profesorId, materiaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada' 
            });
        }

        // Ensure proper UTF-8 encoding
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

// Remove a materia from a professor
const removeProfesorMateria = async (req, res) => {
    try {
        const { id, materiaId } = req.params;
        const profesorId = parseInt(id);
        const materiaIdInt = parseInt(materiaId);

        // Check if the professor exists and is actually a professor
        const [profesores] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = "profesor" AND activo = TRUE',
            [profesorId]
        );

        if (profesores.length === 0) {
            return res.status(404).json({ 
                error: 'Profesor no encontrado' 
            });
        }

        // Check if the materia exists and is assigned to this professor
        const [materias] = await pool.query(
            'SELECT id_materia FROM materias WHERE id_materia = ? AND id_profesor = ? AND activo = TRUE',
            [materiaIdInt, profesorId]
        );

        if (materias.length === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada o no asignada a este profesor' 
            });
        }

        // Remove the professor assignment from the materia
        const [result] = await pool.query(
            'UPDATE materias SET id_profesor = NULL WHERE id_materia = ? AND id_profesor = ?',
            [materiaIdInt, profesorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada o no asignada a este profesor' 
            });
        }

        // Ensure proper UTF-8 encoding
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