const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function verifyCleanup() {
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
    
    // Count subjects per career
    console.log('\n=== Subject count per career ===');
    const [subjectCounts] = await connection.query(`
      SELECT c.nombre as carrera, COUNT(m.id_materia) as total_materias
      FROM carreras c
      LEFT JOIN materias m ON c.id_carrera = m.id_carrera
      GROUP BY c.id_carrera, c.nombre
      ORDER BY c.nombre
    `);
    
    subjectCounts.forEach(row => {
      console.log(`${row.carrera}: ${row.total_materias} subjects`);
    });
    
    // List all subjects
    console.log('\n=== All subjects ===');
    const [allSubjects] = await connection.query(`
      SELECT c.nombre as carrera, m.nombre as materia
      FROM materias m
      JOIN carreras c ON m.id_carrera = c.id_carrera
      ORDER BY c.nombre, m.nombre
    `);
    
    let currentCareer = '';
    allSubjects.forEach(row => {
      if (row.carrera !== currentCareer) {
        console.log(`\n${row.carrera}:`);
        currentCareer = row.carrera;
      }
      console.log(`  • ${row.materia}`);
    });
    
    console.log('\n=== Verification complete ===');
    
  } catch (error) {
    console.error('Error verifying cleanup:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

verifyCleanup();