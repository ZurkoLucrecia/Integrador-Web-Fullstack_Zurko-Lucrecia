const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function checkDuplicates() {
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
    
    // Check for duplicate subjects in Ingeniería en Sistemas (id_carrera = 1)
    console.log('\n=== Checking duplicates for Ingeniería en Sistemas ===');
    const [duplicates1] = await connection.query(`
      SELECT nombre, COUNT(*) as repeticiones
      FROM materias
      WHERE id_carrera = 1
      GROUP BY nombre
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates1.length > 0) {
      console.log('Found duplicates for Ingeniería en Sistemas:');
      duplicates1.forEach(row => {
        console.log(`  ${row.nombre}: ${row.repeticiones} times`);
      });
    } else {
      console.log('No duplicates found for Ingeniería en Sistemas');
    }
    
    // Check for duplicate subjects in Tecnicatura en Programación (id_carrera = 3)
    console.log('\n=== Checking duplicates for Tecnicatura en Programación ===');
    const [duplicates3] = await connection.query(`
      SELECT nombre, COUNT(*) as repeticiones
      FROM materias
      WHERE id_carrera = 3
      GROUP BY nombre
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates3.length > 0) {
      console.log('Found duplicates for Tecnicatura en Programación:');
      duplicates3.forEach(row => {
        console.log(`  ${row.nombre}: ${row.repeticiones} times`);
      });
    } else {
      console.log('No duplicates found for Tecnicatura en Programación');
    }
    
    // Show all subjects grouped by career
    console.log('\n=== All subjects by career ===');
    const [allSubjects] = await connection.query(`
      SELECT c.nombre as carrera, m.nombre as materia, COUNT(*) as total
      FROM materias m
      JOIN carreras c ON m.id_carrera = c.id_carrera
      GROUP BY m.id_carrera, m.nombre
      ORDER BY c.nombre, m.nombre
    `);
    
    let currentCareer = '';
    allSubjects.forEach(row => {
      if (row.carrera !== currentCareer) {
        console.log(`\n${row.carrera}:`);
        currentCareer = row.carrera;
      }
      console.log(`  ${row.materia}${row.total > 1 ? ` (${row.total} duplicates)` : ''}`);
    });
    
  } catch (error) {
    console.error('Error checking duplicates:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

checkDuplicates();