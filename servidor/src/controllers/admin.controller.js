const Materia = require('../models/materias.model');

// Obtener todas las carreras
const obtenerCarreras = async (req, res) => {
    try {
        const db = req.app.get('db');
        
        const [carreras] = await db.query(
            'SELECT * FROM carreras WHERE activo = TRUE ORDER BY nombre'
        );

        // IMPORTANTE: Envolver en objeto con propiedad 'carreras'
        res.json({ carreras });

    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({ 
            error: 'Error al obtener las carreras.',
            detalle: error.message 
        });
    }
};

// Obtener materias de una carrera con información de inscripción
const obtenerMateriasPorCarrera = async (req, res) => {
    try {
        const { id_carrera } = req.params;
        const db = req.app.get('db');

        const materias = await Materia.obtenerPorCarreraConInscripcion(db, id_carrera);

        // IMPORTANTE: Envolver en objeto con propiedad 'materias'
        res.json({ materias });

    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ 
            error: 'Error al obtener las materias.',
            detalle: error.message 
        });
    }
};

// Actualizar período de inscripción de una materia
const actualizarPeriodoInscripcion = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const { inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion } = req.body;
        
        console.log('=== ACTUALIZAR PERÍODO DE INSCRIPCIÓN ===');
        console.log('ID Materia:', id_materia);
        console.log('Datos recibidos:', { 
            inscripcion_habilitada, 
            fecha_inicio_inscripcion, 
            fecha_fin_inscripcion 
        });

        const db = req.app.get('db');

        // Verificar que la materia exista y obtener info completa
        const [materias] = await db.query(`
            SELECT m.id_materia, m.nombre, m.id_carrera, c.nombre as nombre_carrera,
                   m.inscripcion_habilitada as estado_anterior
            FROM materias m
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            WHERE m.id_materia = ?
        `, [id_materia]);

        if (materias.length === 0) {
            console.log('Materia no encontrada:', id_materia);
            return res.status(404).json({ 
                error: 'Materia no encontrada.' 
            });
        }

        const materia = materias[0];
        console.log('Materia encontrada:', materia.nombre);
        console.log('Carrera:', materia.nombre_carrera, '(ID:', materia.id_carrera + ')');
        console.log('Estado anterior inscripción:', materia.estado_anterior);

        // Procesar fechas: convertir strings vacíos a NULL
        const fechaInicio = (fecha_inicio_inscripcion && fecha_inicio_inscripcion.trim() !== '') 
            ? fecha_inicio_inscripcion 
            : null;
        
        const fechaFin = (fecha_fin_inscripcion && fecha_fin_inscripcion.trim() !== '') 
            ? fecha_fin_inscripcion 
            : null;

        // Convertir boolean a número para MySQL
        const habilitada = inscripcion_habilitada ? 1 : 0;

        console.log('Datos procesados:', {
            habilitada,
            fechaInicio,
            fechaFin
        });

        // Actualizar período de inscripción
        const actualizado = await Materia.actualizarPeriodoInscripcion(db, id_materia, {
            inscripcion_habilitada: habilitada,
            fecha_inicio_inscripcion: fechaInicio,
            fecha_fin_inscripcion: fechaFin
        });

        if (!actualizado) {
            console.log('No se actualizó ninguna fila');
            return res.status(500).json({ 
                error: 'Error al actualizar el período de inscripción.' 
            });
        }

        console.log('✓ Período actualizado en BD');

        console.log('Período de inscripción actualizado. Notificaciones deshabilitadas en esta versión.');

        res.json({ 
            mensaje: inscripcion_habilitada 
                ? 'Período de inscripción habilitado exitosamente.' 
                : 'Período de inscripción deshabilitado exitosamente.'
        });

    } catch (error) {
        console.error('❌ Error al actualizar período de inscripción:', error);
        console.error(error.stack);
        res.status(500).json({ 
            error: 'Error al actualizar el período de inscripción.',
            detalle: error.message 
        });
    }
};

// Asignar carrera a un estudiante
const asignarCarreraAUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { id_carrera } = req.body;
        const db = req.app.get('db');

        // Verificar que el usuario exista y sea estudiante
        const [usuarios] = await db.query(
            'SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado.' 
            });
        }

        const usuario = usuarios[0];
        if (usuario.rol !== 'estudiante') {
            return res.status(400).json({ 
                error: 'Solo se puede asignar carrera a estudiantes.' 
            });
        }

        // Verificar que la carrera exista
        if (id_carrera) {
            const [carreras] = await db.query(
                'SELECT id_carrera FROM carreras WHERE id_carrera = ? AND activo = TRUE',
                [id_carrera]
            );

            if (carreras.length === 0) {
                return res.status(404).json({ 
                    error: 'Carrera no encontrada o inactiva.' 
                });
            }
        }

        // Actualizar la carrera del usuario (puede ser NULL para desasignar)
        const [result] = await db.query(
            'UPDATE usuarios SET id_carrera = ? WHERE id_usuario = ?',
            [id_carrera || null, id_usuario]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ 
                error: 'Error al asignar carrera al usuario.' 
            });
        }

        res.json({ 
            mensaje: id_carrera 
                ? 'Carrera asignada exitosamente.' 
                : 'Carrera desasignada exitosamente.' 
        });

    } catch (error) {
        console.error('Error al asignar carrera:', error);
        res.status(500).json({ 
            error: 'Error al asignar carrera.' 
        });
    }
};

// Limpiar inscripciones y archivarlas (preparar para nuevo período)
const limpiarInscripciones = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const db = req.app.get('db');

        console.log('=== LIMPIAR INSCRIPCIONES ===');
        console.log('ID Materia:', id_materia);

        // Verificar que la materia exista
        const [materias] = await db.query(
            'SELECT id_materia, nombre FROM materias WHERE id_materia = ?',
            [id_materia]
        );

        if (materias.length === 0) {
            return res.status(404).json({ 
                error: 'Materia no encontrada.' 
            });
        }

        const materia = materias[0];
        console.log('Materia encontrada:', materia.nombre);

        // Obtener el número de período (contar cuántas veces se ha limpiado esta materia)
        const [lastArchive] = await db.query(
            'SELECT MAX(periodo_numero) as ultimo_periodo FROM inscripciones_archivadas WHERE id_materia = ?',
            [id_materia]
        );

        const periodoNumero = (lastArchive[0].ultimo_periodo || 0) + 1;
        console.log('Número de período:', periodoNumero);

        // Obtener todas las inscripciones activas
        const [inscripciones] = await db.query(
            'SELECT * FROM inscripciones WHERE id_materia = ?',
            [id_materia]
        );

        console.log('Inscripciones a archivar:', inscripciones.length);

        if (inscripciones.length > 0) {
            // Archivar inscripciones
            const archiveData = inscripciones.map(insc => [
                insc.id_inscripcion,
                insc.id_estudiante,
                insc.id_materia,
                insc.fecha_inscripcion,
                insc.estado,
                insc.nota_final,
                periodoNumero
            ]);

            await db.query(
                'INSERT INTO inscripciones_archivadas (id_inscripcion, id_estudiante, id_materia, fecha_inscripcion, estado, nota_final, periodo_numero) VALUES ?',
                [archiveData]
            );

            console.log('✓ Inscripciones archivadas:', inscripciones.length);

            // Eliminar inscripciones actuales
            const [deleteResult] = await db.query(
                'DELETE FROM inscripciones WHERE id_materia = ?',
                [id_materia]
            );

            console.log('✓ Inscripciones eliminadas de la tabla activa');
        }

        // Deshabilitar inscripción para esta materia
        await db.query(
            'UPDATE materias SET inscripcion_habilitada = FALSE WHERE id_materia = ?',
            [id_materia]
        );

        console.log('✓ Inscripción deshabilitada para la materia');
        console.log('✓ Materia preparada para nuevo período');

        res.json({ 
            mensaje: `Inscritos archivados exitosamente. Período ${periodoNumero} completado.`,
            inscritos_archivados: inscripciones.length,
            periodo_numero: periodoNumero
        });

    } catch (error) {
        console.error('❌ Error al limpiar inscripciones:', error);
        console.error(error.stack);
        res.status(500).json({ 
            error: 'Error al archivar inscripciones.',
            detalle: error.message 
        });
    }
};

// Obtener inscripciones archivadas de una materia
const obtenerInscripcionesArchivadas = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const db = req.app.get('db');

        const [archivadas] = await db.query(`
            SELECT ia.*, u.nombre, u.apellido, u.email
            FROM inscripciones_archivadas ia
            LEFT JOIN usuarios u ON ia.id_estudiante = u.id_usuario
            WHERE ia.id_materia = ?
            ORDER BY ia.periodo_numero DESC, ia.fecha_archivado DESC
        `, [id_materia]);

        res.json({ 
            inscripciones_archivadas: archivadas 
        });

    } catch (error) {
        console.error('Error al obtener inscripciones archivadas:', error);
        res.status(500).json({ 
            error: 'Error al obtener inscripciones archivadas.' 
        });
    }
};

module.exports = {
    obtenerCarreras,
    obtenerMateriasPorCarrera,
    actualizarPeriodoInscripcion,
    asignarCarreraAUsuario,
    limpiarInscripciones,           // NUEVO
    obtenerInscripcionesArchivadas   // NUEVO
};