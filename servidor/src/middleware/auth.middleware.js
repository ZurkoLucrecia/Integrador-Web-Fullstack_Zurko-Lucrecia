const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó token.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ensure both id and id_usuario are set
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
        if (!req.usuario) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado.' 
            });
        }

        // If rolesPermitidos is a string, convert to array
        const allowedRoles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

        if (!allowedRoles.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso.' 
            });
        }

        next();
    };
};

module.exports = { verificarToken, verificarRol };