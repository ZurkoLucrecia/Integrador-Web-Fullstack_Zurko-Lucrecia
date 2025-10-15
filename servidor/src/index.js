const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de base de datos
const db = require('./config/database');

// Hacer db disponible para los controladores
app.set('db', db);

// Rutas
app.get('/', (req, res) => {
  res.json({ message: '¡La API de Campus Virtual está funcionando!' });
});

// Importar rutas
const materiasRoutes = require('./routes/materias.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const perfilRoutes = require('./routes/perfil.routes'); // NUEVO

// Usar rutas
app.use('/api/materias', materiasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/perfil', perfilRoutes); // NUEVO

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Endpoints de API disponibles en http://localhost:${PORT}/api`);
});

module.exports = app;