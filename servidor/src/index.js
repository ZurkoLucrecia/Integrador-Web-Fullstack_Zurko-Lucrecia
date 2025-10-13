const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database configuration
const db = require('./config/database');

// Make db available to controllers
app.set('db', db);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Campus Virtual API is running!' });
});

// Import routes
const materiasRoutes = require('./routes/materias.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const perfilRoutes = require('./routes/perfil.routes'); // NUEVO

// Use routes
app.use('/api/materias', materiasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/perfil', perfilRoutes); // NUEVO

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;