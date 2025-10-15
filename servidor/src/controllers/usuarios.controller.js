const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.rol, u.fecha_registro, u.activo, u.id_carrera, c.nombre as nombre_carrera
            FROM usuarios u
            LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
            ORDER BY u.fecha_registro DESC`
        );

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        // Devolver array directamente en lugar de objeto envuelto
        res.json(usuarios);

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol, id_carrera } = req.body;

        console.log('=== CREAR USUARIO ===');
        console.log('Datos recibidos:', { nombre, apellido, email, rol, id_carrera });

        // Validación básica
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ 
                error: 'Nombre, apellido, email y contraseña son requeridos' 
            });
        }

        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                error: 'El email ya está registrado' 
            });
        }

        // Hashear contraseña con bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario CON carrera
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido, email, password, rol, id_carrera) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword, rol || 'estudiante', id_carrera || null]
        );

        const newUserId = result.insertId;
        console.log('Usuario creado con ID:', newUserId);

        // Obtener el usuario creado (sin contraseña)
        const [users] = await pool.query(
            'SELECT id_usuario, nombre, apellido, email, rol, fecha_registro, id_carrera FROM usuarios WHERE id_usuario = ?',
            [newUserId]
        );

        console.log(' Usuario creado exitosamente');

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: users[0]
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// Actualizar un usuario
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, rol, activo, id_carrera, password } = req.body;

        console.log('=== ACTUALIZAR USUARIO ===');
        console.log('ID:', id);
        console.log('Datos recibidos:', { nombre, apellido, email, rol, activo, id_carrera, tienePassword: !!password });

        // Validación básica
        if (!nombre || !apellido || !email) {
            return res.status(400).json({ 
                error: 'Nombre, apellido y email son requeridos' 
            });
        }

        let updateQuery = `UPDATE usuarios 
            SET nombre = ?, apellido = ?, email = ?, rol = ?, activo = ?, id_carrera = ?`;
        let updateParams = [nombre, apellido, email, rol, activo !== undefined ? activo : true, id_carrera || null, id];

        // Si se proporciona contraseña, actualizarla también
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = `UPDATE usuarios 
                SET nombre = ?, apellido = ?, email = ?, rol = ?, activo = ?, id_carrera = ?, password = ?`;
            updateParams = [nombre, apellido, email, rol, activo !== undefined ? activo : true, id_carrera || null, hashedPassword, id];
        }

        // Actualizar usuario
        const [result] = await pool.query(
            updateQuery + ' WHERE id_usuario = ?',
            updateParams
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        console.log('Usuario actualizado');

        // Obtener el usuario actualizado
        const [users] = await pool.query(
            'SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.rol, u.fecha_registro, u.activo, u.id_carrera, c.nombre as nombre_carrera FROM usuarios u LEFT JOIN carreras c ON u.id_carrera = c.id_carrera WHERE u.id_usuario = ?',
            [id]
        );

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: users[0]
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('=== ELIMINAR USUARIO ===');
        console.log('ID:', id);

        // Eliminar usuario
        const [result] = await pool.query(
            'DELETE FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        console.log('Usuario eliminado');

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

module.exports = {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
};