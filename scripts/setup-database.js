const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../servidor/.env' });

async function setupDatabase() {
  let connection;
  
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ADMIN'
    });
    
    console.log('Connected to MySQL server');
    
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS campus_virtual CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Database created successfully');
    
    // Use the database
    await connection.query('USE campus_virtual');
    console.log('Using campus_virtual database');
    
    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('estudiante', 'profesor', 'administrador') NOT NULL DEFAULT 'estudiante',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        fecha_nacimiento DATE NULL,
        telefono VARCHAR(20) NULL,
        direccion VARCHAR(255) NULL,
        especialidad VARCHAR(100) NULL,
        titulo_academico VARCHAR(150) NULL,
        legajo VARCHAR(50) NULL,
        documento VARCHAR(20) NULL,
        id_carrera INT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Usuarios table created');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS carreras (
        id_carrera INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        duracion_anios INT,
        activo BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Carreras table created');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materias (
        id_materia INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        id_carrera INT,
        id_profesor INT,
        cuatrimestre INT,
        anio_carrera INT,
        activo BOOLEAN DEFAULT TRUE,
        inscripcion_habilitada BOOLEAN DEFAULT FALSE,
        fecha_inicio_inscripcion DATETIME NULL,
        fecha_fin_inscripcion DATETIME NULL,
        FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera) ON DELETE SET NULL,
        FOREIGN KEY (id_profesor) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Materias table created');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
        id_estudiante INT NOT NULL,
        id_materia INT NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('activo', 'aprobado', 'desaprobado', 'cursando') DEFAULT 'cursando',
        nota_final DECIMAL(4,2),
        FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE,
        UNIQUE KEY (id_estudiante, id_materia)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Inscripciones table created');
    
    // Insert initial data
    try {
      await connection.query(`
        INSERT IGNORE INTO usuarios (id_usuario, nombre, apellido, email, password, rol) VALUES
        (1, 'Admin', 'Sistema', 'admin@campus.com', '$2b$10$p0V9hR5KBTWihlc7511C8e7U/pzGFFUK/R.NVdg7EyDE0rQaxEAAO', 'administrador')
      `);
      console.log('Admin user inserted or already exists');
    } catch (error) {
      console.log('Admin user already exists');
    }
    
    try {
      await connection.query(`
        INSERT IGNORE INTO usuarios (nombre, apellido, email, password, rol) VALUES
        ('María', 'González', 'maria.gonzalez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor'),
        ('Carlos', 'Rodríguez', 'carlos.rodriguez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor'),
        ('Ana', 'Martínez', 'ana.martinez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor')
      `);
      console.log('Professors inserted or already exist');
    } catch (error) {
      console.log('Professors already exist');
    }
    
    try {
      await connection.query(`
        INSERT IGNORE INTO usuarios (nombre, apellido, email, password, rol) VALUES
        ('Juan', 'Pérez', 'juan.perez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante'),
        ('Laura', 'Fernández', 'laura.fernandez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante'),
        ('Pedro', 'Sánchez', 'pedro.sanchez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante')
      `);
      console.log('Students inserted or already exist');
    } catch (error) {
      console.log('Students already exist');
    }
    
    try {
      await connection.query(`
        INSERT IGNORE INTO carreras (id_carrera, nombre, descripcion, duracion_anios) VALUES
        (1, 'Ingeniería en Sistemas', 'Carrera enfocada en desarrollo de software y sistemas', 5),
        (2, 'Licenciatura en Administración', 'Carrera de gestión empresarial y administración', 4),
        (3, 'Tecnicatura en Programación', 'Carrera técnica en desarrollo de software', 3)
      `);
      console.log('Careers inserted or already exist');
    } catch (error) {
      console.log('Careers already exist');
    }
    
    try {
      await connection.query(`
        INSERT IGNORE INTO materias (nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera, inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion) VALUES
        ('Programación I', 'Fundamentos de programación', 1, 2, 1, 1, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
        ('Base de Datos', 'Diseño y gestión de bases de datos', 1, 3, 2, 2, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
        ('Desarrollo Web', 'Creación de aplicaciones web', 1, 4, 1, 3, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
        ('Matemática I', 'Álgebra y cálculo', 1, 2, 1, 1, FALSE, NULL, NULL),
        ('Administración General', 'Fundamentos de administración', 2, 3, 1, 1, FALSE, NULL, NULL)
      `);
      console.log('Subjects inserted or already exist');
    } catch (error) {
      console.log('Subjects already exist');
    }
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupDatabase();