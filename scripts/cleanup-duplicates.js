const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function cleanupDuplicates() {
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
    
    // Delete duplicate subjects, keeping only the one with the minimum id_materia
    console.log('\n=== Cleaning up duplicate subjects ===');
    
    // First, let's see what we're going to delete
    const [duplicatesToDelete] = await connection.query(`
      SELECT m1.id_materia, m1.nombre, c.nombre as carrera
      FROM materias m1
      JOIN carreras c ON m1.id_carrera = c.id_carrera
      WHERE m1.id_materia NOT IN (
        SELECT MIN(m2.id_materia) 
        FROM materias m2 
        WHERE m2.nombre = m1.nombre AND m2.id_carrera = m1.id_carrera
      )
      ORDER BY c.nombre, m1.nombre
    `);
    
    console.log(`Found ${duplicatesToDelete.length} duplicate subjects to delete:`);
    duplicatesToDelete.forEach(row => {
      console.log(`  ${row.nombre} (${row.carrera}) - ID: ${row.id_materia}`);
    });
    
    // Now delete the duplicates
    const [result] = await connection.query(`
      DELETE m1 FROM materias m1
      WHERE m1.id_materia NOT IN (
        SELECT * FROM (
          SELECT MIN(m2.id_materia) 
          FROM materias m2 
          WHERE m2.nombre = m1.nombre AND m2.id_carrera = m1.id_carrera
        ) as temp
      )
    `);
    
    console.log(`\nDeleted ${result.affectedRows} duplicate subjects successfully!`);
    
    // Verify cleanup
    console.log('\n=== Verifying cleanup ===');
    const [remainingDuplicates] = await connection.query(`
      SELECT nombre, COUNT(*) as repeticiones
      FROM materias
      GROUP BY nombre, id_carrera
      HAVING COUNT(*) > 1
    `);
    
    if (remainingDuplicates.length === 0) {
      console.log('All duplicates have been successfully removed!');
    } else {
      console.log('Still found duplicates:');
      remainingDuplicates.forEach(row => {
        console.log(`  ${row.nombre}: ${row.repeticiones} times`);
      });
    }
    
  } catch (error) {
    console.error('Error cleaning up duplicates:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

cleanupDuplicates();