const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función de inicio de sesión (implementación con base de datos real)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        const db = req.app.get('db');

        // Buscar usuario por email en la base de datos real
        const [users] = await db.query(
            'SELECT id_usuario, nombre, apellido, email, password, rol FROM usuarios WHERE email = ? AND activo = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        const user = users[0];

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                id_usuario: user.id_usuario,
                nombre: user.nombre, 
                apellido: user.apellido, 
                email: user.email, 
                rol: user.rol 
            },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '24h' }
        );

        // Devolver datos del usuario y token (sin contraseña)
        const { password: _, ...userWithoutPassword } = user;
        
        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: userWithoutPassword
        });

    } catch (error) {
        console.error('Error en inicio de sesión:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// Obtener perfil del usuario actual (implementación con base de datos real)
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const db = req.app.get('db');

        const [users] = await db.query(
            'SELECT id_usuario, nombre, apellido, email, rol FROM usuarios WHERE id_usuario = ? AND activo = TRUE',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        const user = users[0];

        // Devolver datos del usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;

        // Asegurar codificación UTF-8 correcta
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            usuario: userWithoutPassword
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

module.exports = {
    login,
    getProfile
};