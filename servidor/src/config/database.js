const mysql = require('mysql2/promise');

// Cargar variables de entorno
require('dotenv').config();

// Crear un pool de conexiones con codificación UTF-8 adecuada
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_virtual',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
  // Se eliminó la collation para evitar la advertencia
});

// Probar la conexión
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos exitosa');
    connection.release();
  })
  .catch(error => {
    console.error('Falló la conexión a la base de datos:', error.message);
  });

module.exports = pool;