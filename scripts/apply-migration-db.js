const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool using the same configuration as the main app
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ADMIN',
  database: process.env.DB_NAME || 'campus_virtual',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
  // Removed collation to avoid the warning
});

async function columnExists(connection, tableName, columnName) {
  try {
    const [rows] = await connection.execute(
      'SHOW COLUMNS FROM ?? LIKE ?',
      [tableName, columnName]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking column ${columnName}:`, error.message);
    return false;
  }
}

async function applyMigration() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('Connected to the database successfully!');
    
    // Apply migration commands
    console.log('Applying migration...');
    
    // Add common fields for all users
    if (!(await columnExists(connection, 'usuarios', 'fecha_nacimiento'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN fecha_nacimiento DATE NULL AFTER email');
      console.log('Added fecha_nacimiento column');
    } else {
      console.log('fecha_nacimiento column already exists');
    }
    
    if (!(await columnExists(connection, 'usuarios', 'telefono'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL AFTER fecha_nacimiento');
      console.log('Added telefono column');
    } else {
      console.log('telefono column already exists');
    }
    
    if (!(await columnExists(connection, 'usuarios', 'direccion'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(255) NULL AFTER telefono');
      console.log('Added direccion column');
    } else {
      console.log('direccion column already exists');
    }
    
    // Add professor-specific fields
    if (!(await columnExists(connection, 'usuarios', 'especialidad'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN especialidad VARCHAR(100) NULL AFTER direccion');
      console.log('Added especialidad column');
    } else {
      console.log('especialidad column already exists');
    }
    
    if (!(await columnExists(connection, 'usuarios', 'titulo_academico'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN titulo_academico VARCHAR(150) NULL AFTER especialidad');
      console.log('Added titulo_academico column');
    } else {
      console.log('titulo_academico column already exists');
    }
    
    // Add student-specific fields
    if (!(await columnExists(connection, 'usuarios', 'legajo'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN legajo VARCHAR(50) NULL AFTER titulo_academico');
      console.log('Added legajo column');
    } else {
      console.log('legajo column already exists');
    }
    
    if (!(await columnExists(connection, 'usuarios', 'documento'))) {
      await connection.execute('ALTER TABLE usuarios ADD COLUMN documento VARCHAR(20) NULL AFTER legajo');
      console.log('Added documento column');
    } else {
      console.log('documento column already exists');
    }
    
    // Describe table to verify
    const [rows] = await connection.execute('DESC usuarios');
    console.log('Table structure:');
    console.table(rows);
    
    console.log('Migration applied successfully!');
    
  } catch (error) {
    console.error('Error applying migration:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection closed');
    }
  }
}

applyMigration();