const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function updateDatabaseSchema() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ADMIN',
      database: process.env.DB_NAME || 'campus_virtual'
    });
    
    console.log('Connected to MySQL server');
    console.log('Using campus_virtual database');
    
    // Add new columns to materias table
    try {
      await connection.query(`
        ALTER TABLE materias 
        ADD COLUMN fecha_inicio_cursada DATETIME NULL,
        ADD COLUMN fecha_fin_cursada DATETIME NULL
      `);
      console.log('✓ Added fecha_inicio_cursada and fecha_fin_cursada columns to materias table');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ Columns fecha_inicio_cursada and fecha_fin_cursada already exist in materias table');
      } else {
        throw error;
      }
    }
    
    // Create inscripciones_archivadas table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inscripciones_archivadas (
        id_archivo INT AUTO_INCREMENT PRIMARY KEY,
        id_inscripcion INT NOT NULL,
        id_estudiante INT NOT NULL,
        id_materia INT NOT NULL,
        fecha_inscripcion TIMESTAMP,
        estado ENUM('activo', 'aprobado', 'desaprobado', 'cursando') DEFAULT 'cursando',
        nota_final DECIMAL(4,2),
        periodo_numero INT COMMENT 'Número de período archivado',
        fecha_archivado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created inscripciones_archivadas table');
    
    console.log('\nDatabase schema updated successfully!');
    
  } catch (error) {
    console.error('Error updating database schema:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

updateDatabaseSchema();