const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function verifyNewEndpoints() {
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
    
    // Check if new columns exist in materias table
    console.log('\n=== Checking materias table structure ===');
    const [materiasColumns] = await connection.query(`
      SHOW COLUMNS FROM materias LIKE 'fecha_inicio_cursada'
    `);
    
    if (materiasColumns.length > 0) {
      console.log('✓ fecha_inicio_cursada column exists in materias table');
    } else {
      console.log('✗ fecha_inicio_cursada column does not exist in materias table');
    }
    
    const [materiasColumns2] = await connection.query(`
      SHOW COLUMNS FROM materias LIKE 'fecha_fin_cursada'
    `);
    
    if (materiasColumns2.length > 0) {
      console.log('✓ fecha_fin_cursada column exists in materias table');
    } else {
      console.log('✗ fecha_fin_cursada column does not exist in materias table');
    }
    
    // Check if inscripciones_archivadas table exists
    console.log('\n=== Checking inscripciones_archivadas table ===');
    try {
      const [tables] = await connection.query(`
        SHOW TABLES LIKE 'inscripciones_archivadas'
      `);
      
      if (tables.length > 0) {
        console.log('✓ inscripciones_archivadas table exists');
        
        // Show table structure
        const [tableStructure] = await connection.query(`
          DESCRIBE inscripciones_archivadas
        `);
        
        console.log('\nTable structure:');
        tableStructure.forEach(row => {
          console.log(`  ${row.Field}: ${row.Type}`);
        });
      } else {
        console.log('✗ inscripciones_archivadas table does not exist');
      }
    } catch (error) {
      console.log('✗ Error checking inscripciones_archivadas table:', error.message);
    }
    
    console.log('\n=== Verification complete ===');
    
  } catch (error) {
    console.error('Error verifying new endpoints:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

verifyNewEndpoints();