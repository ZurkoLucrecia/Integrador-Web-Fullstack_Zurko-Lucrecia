const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// Middleware para verificar token
const verificarToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó token.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get full user information from database
        const [users] = await pool.query(
            'SELECT id_usuario, nombre, apellido, email, rol FROM usuarios WHERE id_usuario = ? AND activo = TRUE',
            [decoded.id_usuario || decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Usuario no encontrado o inactivo.' 
            });
        }
        
        req.user = users[0];
        req.usuario = {
            ...decoded,
            id: decoded.id_usuario || decoded.id,
            id_usuario: decoded.id_usuario || decoded.id
        };
        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Token inválido o expirado.' 
        });
    }
};

// Middleware para verificar rol
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado.' 
            });
        }

        // If rolesPermitidos is a string, convert to array
        const allowedRoles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso.' 
            });
        }

        next();
    };
};

module.exports = { verificarToken, verificarRol };