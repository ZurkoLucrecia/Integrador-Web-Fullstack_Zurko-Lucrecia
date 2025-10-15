const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Obtener perfil del usuario actual
const obtenerPerfil = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        console.log('Obteniendo perfil para usuario ID:', userId);

        const [usuarios] = await pool.query(
            `SELECT id_usuario, nombre, apellido, email, rol, fecha_nacimiento, 
                    telefono, direccion, especialidad, titulo_academico, legajo, 
                    documento, id_carrera, fecha_registro
             FROM usuarios 
             WHERE id_usuario = ? AND activo = TRUE`,
            [userId]
        );

        if (usuarios.length === 0) {
            console.log('Usuario no encontrado para ID:', userId);
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        console.log('Perfil obtenido correctamente para usuario ID:', userId);
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            usuario: usuarios[0]
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// Actualizar perfil del usuario actual
const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        console.log('Actualizando perfil para usuario ID:', userId);
        console.log('Datos recibidos:', req.body);

        const { 
            nombre, 
            apellido, 
            email, 
            fecha_nacimiento, 
            telefono, 
            direccion,
            especialidad,
            titulo_academico,
            legajo,
            documento
        } = req.body;

        // Validación básica
        if (!nombre || !apellido || !email) {
            console.log('Validación fallida: faltan campos obligatorios');
            return res.status(400).json({ 
                error: 'Nombre, apellido y email son requeridos' 
            });
        }

        // Verificar si el email ya está en uso por otro usuario
        const [existingUsers] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
            [email, userId]
        );

        if (existingUsers.length > 0) {
            console.log('Email ya está en uso por otro usuario');
            return res.status(400).json({ 
                error: 'El email ya está en uso por otro usuario' 
            });
        }

        // Actualizar perfil
        console.log('Ejecutando UPDATE para usuario ID:', userId);
        const [result] = await pool.query(
            `UPDATE usuarios 
             SET nombre = ?, apellido = ?, email = ?, fecha_nacimiento = ?, 
                 telefono = ?, direccion = ?, especialidad = ?, titulo_academico = ?,
                 legajo = ?, documento = ?
             WHERE id_usuario = ?`,
            [
                nombre, 
                apellido, 
                email, 
                fecha_nacimiento || null, 
                telefono || null, 
                direccion || null,
                especialidad || null,
                titulo_academico || null,
                legajo || null,
                documento || null,
                userId
            ]
        );

        console.log('Resultado del UPDATE:', result);

        if (result.affectedRows === 0) {
            console.log('No se actualizó ninguna fila para usuario ID:', userId);
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        // Obtener el perfil actualizado
        const [usuarios] = await pool.query(
            `SELECT id_usuario, nombre, apellido, email, rol, fecha_nacimiento, 
                    telefono, direccion, especialidad, titulo_academico, legajo, 
                    documento, id_carrera, fecha_registro
             FROM usuarios 
             WHERE id_usuario = ?`,
            [userId]
        );

        console.log('Perfil actualizado correctamente para usuario ID:', userId);
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: usuarios[0]
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// Cambiar contraseña del usuario actual
const cambiarPassword = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        console.log('Cambiando contraseña para usuario ID:', userId);

        const { currentPassword, newPassword } = req.body;

        // Validación básica
        if (!currentPassword || !newPassword) {
            console.log('Faltan contraseñas requeridas');
            return res.status(400).json({ 
                error: 'La contraseña actual y la nueva contraseña son requeridas' 
            });
        }

        if (newPassword.length < 6) {
            console.log('Contraseña nueva muy corta');
            return res.status(400).json({ 
                error: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Obtener la contraseña actual del usuario
        const [usuarios] = await pool.query(
            'SELECT password FROM usuarios WHERE id_usuario = ? AND activo = TRUE',
            [userId]
        );

        if (usuarios.length === 0) {
            console.log('Usuario no encontrado para cambio de contraseña, ID:', userId);
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        // Verificar la contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, usuarios[0].password);

        if (!isPasswordValid) {
            console.log('Contraseña actual incorrecta para usuario ID:', userId);
            return res.status(401).json({ 
                error: 'La contraseña actual es incorrecta' 
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña
        const [result] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
            [hashedPassword, userId]
        );

        if (result.affectedRows === 0) {
            console.log('No se pudo actualizar la contraseña para usuario ID:', userId);
            return res.status(500).json({ 
                error: 'Error al actualizar la contraseña' 
            });
        }

        console.log('Contraseña actualizada correctamente para usuario ID:', userId);
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    cambiarPassword
};