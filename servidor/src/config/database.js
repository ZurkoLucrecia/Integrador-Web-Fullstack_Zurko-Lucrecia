const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

// Create a connection pool with proper UTF-8 encoding
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_virtual',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
  // Removed collation to avoid the warning
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection successful');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection failed:', error.message);
  });

module.exports = pool;