// Modelo para la entidad Materia
class Materia {
  constructor(id_materia, nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera, activo, inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion) {
    this.id_materia = id_materia;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.id_carrera = id_carrera;
    this.id_profesor = id_profesor;
    this.cuatrimestre = cuatrimestre;
    this.anio_carrera = anio_carrera;
    this.activo = activo;
    this.inscripcion_habilitada = inscripcion_habilitada;
    this.fecha_inicio_inscripcion = fecha_inicio_inscripcion;
    this.fecha_fin_inscripcion = fecha_fin_inscripcion;
  }

  // Método para obtener todas las materias
  static async obtenerTodas(db, filtros = {}) {
    try {
      let query = `
        SELECT m.*, 
               c.nombre as nombre_carrera,
               u.nombre as nombre_profesor, 
               u.apellido as apellido_profesor
        FROM materias m
        LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
        LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
        WHERE m.activo = TRUE
      `;
      const params = [];

      if (filtros.id_carrera) {
        query += ' AND m.id_carrera = ?';
        params.push(filtros.id_carrera);
      }

      if (filtros.id_profesor) {
        query += ' AND m.id_profesor = ?';
        params.push(filtros.id_profesor);
      }

      if (filtros.cuatrimestre) {
        query += ' AND m.cuatrimestre = ?';
        params.push(filtros.cuatrimestre);
      }

      if (filtros.anio_carrera) {
        query += ' AND m.anio_carrera = ?';
        params.push(filtros.anio_carrera);
      }

      // Para estudiantes, solo mostrar materias con inscripción habilitada y dentro del período
      if (filtros.rol === 'estudiante') {
        query += ' AND m.inscripcion_habilitada = TRUE';
        // Verificar fechas si están definidas
        const now = new Date();
        query += ' AND (m.fecha_inicio_inscripcion IS NULL OR m.fecha_inicio_inscripcion <= ?)';
        query += ' AND (m.fecha_fin_inscripcion IS NULL OR m.fecha_fin_inscripcion >= ?)';
        params.push(now, now);
      }

      query += ' ORDER BY m.nombre';

      const [materias] = await db.query(query, params);
      return materias;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener una materia por ID
  static async obtenerPorId(db, id) {
    try {
      const [materias] = await db.query(`
        SELECT m.*, 
               c.nombre as nombre_carrera,
               u.nombre as nombre_profesor, 
               u.apellido as apellido_profesor,
               u.email as email_profesor
        FROM materias m
        LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
        LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
        WHERE m.id_materia = ?
      `, [id]);

      if (materias.length === 0) {
        return null;
      }

      // Obtener cantidad de estudiantes inscritos
      const [inscritos] = await db.query(
        'SELECT COUNT(*) as total FROM inscripciones WHERE id_materia = ? AND estado = "cursando"',
        [id]
      );

      return {
        ...materias[0],
        estudiantes_inscritos: inscritos[0].total
      };
    } catch (error) {
      throw error;
    }
  }

  // Método para crear una materia
  static async crear(db, datos) {
    try {
      const { nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera } = datos;

      const [result] = await db.query(
        'INSERT INTO materias (nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para actualizar una materia
  static async actualizar(db, id, datos) {
    try {
      const { nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera } = datos;

      const [result] = await db.query(
        'UPDATE materias SET nombre = ?, descripcion = ?, id_carrera = ?, id_profesor = ?, cuatrimestre = ?, anio_carrera = ? WHERE id_materia = ?',
        [nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para actualizar el período de inscripción de una materia
  static async actualizarPeriodoInscripcion(db, id, datos) {
    try {
      const { inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion } = datos;

      const [result] = await db.query(
        'UPDATE materias SET inscripcion_habilitada = ?, fecha_inicio_inscripcion = ?, fecha_fin_inscripcion = ? WHERE id_materia = ?',
        [inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar una materia 
  static async eliminar(db, id) {
    try {
      const [result] = await db.query(
        'UPDATE materias SET activo = FALSE WHERE id_materia = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener materias por carrera
  static async obtenerPorCarrera(db, id_carrera) {
    try {
      const [materias] = await db.query(`
        SELECT m.*, 
               c.nombre as nombre_carrera,
               u.nombre as nombre_profesor, 
               u.apellido as apellido_profesor
        FROM materias m
        LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
        LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
        WHERE m.id_carrera = ? AND m.activo = TRUE
        ORDER BY m.nombre
      `, [id_carrera]);

      return materias;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener materias por carrera con información de inscripción
  static async obtenerPorCarreraConInscripcion(db, id_carrera) {
    try {
      const [materias] = await db.query(`
        SELECT m.*, 
               c.nombre as nombre_carrera,
               u.nombre as nombre_profesor, 
               u.apellido as apellido_profesor,
               (SELECT COUNT(*) FROM inscripciones i WHERE i.id_materia = m.id_materia AND i.estado = 'cursando') as estudiantes_inscritos
        FROM materias m
        LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
        LEFT JOIN usuarios u ON m.id_profesor = u.id_usuario
        WHERE m.id_carrera = ? AND m.activo = TRUE
        ORDER BY m.nombre
      `, [id_carrera]);

      return materias;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Materia;