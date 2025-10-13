const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function addMateriasTecnicatura() {
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
    
    // Insert subjects for Tecnicatura en Programación (id_carrera = 3)
    const materias = [
      ['Programación I', 'Fundamentos de programación', 3, 2, 1, 1, true],
      ['Programación II', 'Programación orientada a objetos', 3, 3, 2, 1, true],
      ['Base de Datos', 'Diseño y gestión de bases de datos', 3, 4, 1, 2, true],
      ['Desarrollo Web', 'Creación de aplicaciones web', 3, 2, 2, 2, true]
    ];
    
    for (const materia of materias) {
      try {
        await connection.query(`
          INSERT INTO materias (nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera, inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion) 
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
        `, [...materia]);
        console.log(`Inserted subject: ${materia[0]}`);
      } catch (error) {
        console.log(`Subject ${materia[0]} already exists or error:`, error.message);
      }
    }
    
    console.log('All subjects for Tecnicatura en Programación added successfully!');
    
  } catch (error) {
    console.error('Error adding subjects:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

addMateriasTecnicatura();