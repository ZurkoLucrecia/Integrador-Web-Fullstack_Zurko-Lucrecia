// Inscribir estudiante en materias
const inscribirEstudiante = async (req, res) => {
    try {
        const { id_materia } = req.body; // ID de la materia
        const id_estudiante = req.usuario.id_usuario; // CORREGIDO

        if (!id_materia) {
            return res.status(400).json({ 
                error: 'Debe proporcionar una materia para inscribirse.' 
            });
        }

        const db = req.app.get('db');
        
        // Obtener carrera del estudiante
        const [estudiantes] = await db.query(
            'SELECT id_carrera FROM usuarios WHERE id_usuario = ?',
            [id_estudiante]
        );

        if (estudiantes.length === 0 || !estudiantes[0].id_carrera) {
            return res.status(400).json({ 
                error: 'No tienes una carrera asignada. Contacta al administrador.' 
            });
        }

        const id_carrera_estudiante = estudiantes[0].id_carrera;
        
        // Verificar que la materia exista, esté activa, tenga inscripción habilitada y pertenezca a la carrera del estudiante
        const [materias] = await db.query(
            `SELECT * FROM materias 
             WHERE id_materia = ? AND activo = TRUE AND inscripcion_habilitada = TRUE AND id_carrera = ?`,
            [id_materia, id_carrera_estudiante]
        );

        if (materias.length === 0) {
            return res.status(400).json({ 
                error: 'La materia no existe, no está activa, no tiene inscripción habilitada o no pertenece a tu carrera.' 
            });
        }

        const materia = materias[0];
        
        // Verificar fechas de inscripción si están definidas
        const now = new Date();
        if (materia.fecha_inicio_inscripcion && new Date(materia.fecha_inicio_inscripcion) > now) {
            return res.status(400).json({ 
                error: 'El período de inscripción aún no ha comenzado.' 
            });
        }
        
        if (materia.fecha_fin_inscripcion && new Date(materia.fecha_fin_inscripcion) < now) {
            return res.status(400).json({ 
                error: 'El período de inscripción ha finalizado.' 
            });
        }

        // Verificar si el estudiante ya está inscrito en esta materia
        const [inscripcionesExistentes] = await db.query(
            'SELECT id_inscripcion FROM inscripciones WHERE id_estudiante = ? AND id_materia = ? AND estado = "cursando"',
            [id_estudiante, id_materia]
        );

        if (inscripcionesExistentes.length > 0) {
            return res.status(400).json({ 
                error: 'Ya está inscrito en esta materia.' 
            });
        }

        // Inscribir al estudiante en la materia
        const [result] = await db.query(
            'INSERT INTO inscripciones (id_estudiante, id_materia, estado) VALUES (?, ?, "cursando")',
            [id_estudiante, id_materia]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ 
                error: 'Error al procesar la inscripción.' 
            });
        }

        res.json({ 
            mensaje: `Se ha inscrito exitosamente en ${materia.nombre}`,
            id_inscripcion: result.insertId
        });

    } catch (error) {
        console.error('Error al inscribir estudiante:', error);
        res.status(500).json({ 
            error: 'Error al procesar la inscripción.' 
        });
    }
};

// Obtener materias disponibles para inscripción (para estudiantes)
const obtenerMateriasDisponibles = async (req, res) => {
    try {
        const id_estudiante = req.usuario.id_usuario; // CORREGIDO
        const db = req.app.get('db');

        console.log(`=== OBTENER MATERIAS DISPONIBLES ===`);
        console.log(`ID Estudiante: ${id_estudiante}`);
        console.log(`Usuario completo:`, req.usuario); // CORREGIDO

        // Obtener carrera del estudiante
        const [estudiantes] = await db.query(
            'SELECT id_carrera FROM usuarios WHERE id_usuario = ?',
            [id_estudiante]
        );

        console.log(`Resultado consulta estudiante:`, estudiantes);

        if (estudiantes.length === 0 || !estudiantes[0].id_carrera) {
            // Si no tiene carrera asignada, devolver array vacío
            console.log(`Estudiante no tiene carrera asignada, devolviendo array vacío`);
            
            // También verificar el registro completo del usuario para ver qué hay ahí
            const [fullUser] = await db.query(
                'SELECT * FROM usuarios WHERE id_usuario = ?',
                [id_estudiante]
            );
            console.log(`Registro completo del usuario:`, fullUser);
            
            return res.json([]);
        }

        const id_carrera_estudiante = estudiantes[0].id_carrera;
        console.log(`ID Carrera Estudiante: ${id_carrera_estudiante}`);

        // Obtener materias de la carrera del estudiante con inscripción habilitada y dentro del período
        const [materias] = await db.query(`
            SELECT m.*, 
                   c.nombre as nombre_carrera,
                   u.nombre as nombre_profesor, 
                   u.apellido as apellido_profesor
            FROM materias m
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
            WHERE m.activo = TRUE 
              AND m.id_carrera = ?
              AND m.inscripcion_habilitada = TRUE
              AND (m.fecha_inicio_inscripcion IS NULL OR m.fecha_inicio_inscripcion <= NOW())
              AND (m.fecha_fin_inscripcion IS NULL OR m.fecha_fin_inscripcion >= NOW())
              AND m.id_materia NOT IN (
                SELECT id_materia FROM inscripciones 
                WHERE id_estudiante = ? AND estado = 'cursando'
              )
            ORDER BY m.nombre
        `, [id_carrera_estudiante, id_estudiante]);

        console.log(`Materias encontradas:`, materias);
        console.log(`Número de materias: ${materias.length}`);

        res.json(materias);

    } catch (error) {
        console.error('Error al obtener materias disponibles:', error);
        res.status(500).json({ 
            error: 'Error al obtener las materias disponibles.' 
        });
    }
};

// Obtener materias en las que el estudiante está inscrito
const obtenerMateriasInscritas = async (req, res) => {
    try {
        const id_estudiante = req.usuario.id_usuario; // CORREGIDO
        const db = req.app.get('db');

        const [materias] = await db.query(`
            SELECT m.*, 
                   c.nombre as nombre_carrera,
                   u.nombre as nombre_profesor, 
                   u.apellido as apellido_profesor,
                   i.estado,
                   i.nota_final
            FROM inscripciones i
            JOIN materias m ON i.id_materia = m.id_materia
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
            WHERE i.id_estudiante = ? AND i.estado = 'cursando'
            ORDER BY m.nombre
        `, [id_estudiante]);

        res.json(materias);

    } catch (error) {
        console.error('Error al obtener materias inscritas:', error);
        res.status(500).json({ 
            error: 'Error al obtener las materias inscritas.' 
        });
    }
};

// NUEVO: Obtener calificaciones (TODAS las inscripciones, incluyendo aprobadas y desaprobadas)
const obtenerCalificaciones = async (req, res) => {
    try {
        const id_estudiante = req.usuario.id_usuario; // CORREGIDO
        const db = req.app.get('db');

        console.log('📊 Obteniendo calificaciones para estudiante:', id_estudiante);

        const [calificaciones] = await db.query(`
            SELECT m.*, 
                   c.nombre as nombre_carrera,
                   u.nombre as nombre_profesor, 
                   u.apellido as apellido_profesor,
                   i.estado,
                   i.nota_final,
                   i.id_inscripcion,
                   i.fecha_inscripcion
            FROM inscripciones i
            JOIN materias m ON i.id_materia = m.id_materia
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
            WHERE i.id_estudiante = ?
            ORDER BY i.fecha_inscripcion DESC
        `, [id_estudiante]);

        console.log(`✅ ${calificaciones.length} calificaciones encontradas`);
        res.json(calificaciones);

    } catch (error) {
        console.error('❌ Error al obtener calificaciones:', error);
        res.status(500).json({ 
            error: 'Error al obtener las calificaciones.' 
        });
    }
};

// Cancelar inscripción en una materia
const cancelarInscripcion = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const id_estudiante = req.usuario.id_usuario; // CORREGIDO
        const db = req.app.get('db');

        // Verificar que la inscripción existe y está en estado 'cursando'
        const [inscripciones] = await db.query(
            'SELECT id_inscripcion FROM inscripciones WHERE id_estudiante = ? AND id_materia = ? AND estado = "cursando"',
            [id_estudiante, id_materia]
        );

        if (inscripciones.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontró una inscripción activa para esta materia.' 
            });
        }

        // Cancelar la inscripción (cambiar estado)
        const [result] = await db.query(
            'UPDATE inscripciones SET estado = "desaprobado" WHERE id_estudiante = ? AND id_materia = ?',
            [id_estudiante, id_materia]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ 
                error: 'Error al cancelar la inscripción.' 
            });
        }

        res.json({ mensaje: 'Inscripción cancelada exitosamente.' });

    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({ 
            error: 'Error al cancelar la inscripción.' 
        });
    }
};

module.exports = {
    inscribirEstudiante,
    obtenerMateriasDisponibles,
    obtenerMateriasInscritas,
    obtenerCalificaciones, // NUEVO
    cancelarInscripcion
};