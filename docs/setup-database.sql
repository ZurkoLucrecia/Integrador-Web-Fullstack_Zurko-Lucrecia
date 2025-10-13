-- Campus Virtual Database Setup Script
-- Run this script in your MySQL client to set up the database

-- Create the database with UTF-8 charset
CREATE DATABASE IF NOT EXISTS campus_virtual 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
  
USE campus_virtual;

-- Drop tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS entregas;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS materiales;
DROP TABLE IF EXISTS eventos_calendario;
DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS carreras;
DROP TABLE IF EXISTS usuarios;

-- Tabla de usuarios (obligatoria según requisitos)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'profesor', 'administrador') NOT NULL DEFAULT 'estudiante',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de carreras
CREATE TABLE carreras (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    duracion_anios INT,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de materias
CREATE TABLE materias (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de inscripciones
CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_materia INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'aprobado', 'desaprobado', 'cursando') DEFAULT 'cursando',
    nota_final DECIMAL(4,2),
    FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE,
    UNIQUE KEY (id_estudiante, id_materia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tareas
CREATE TABLE tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME NOT NULL,
    puntaje_max DECIMAL(5,2) DEFAULT 100,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de entregas
CREATE TABLE entregas (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_estudiante INT NOT NULL,
    archivo VARCHAR(255),
    comentario TEXT,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion DECIMAL(5,2),
    feedback TEXT,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    UNIQUE KEY (id_tarea, id_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de materiales
CREATE TABLE materiales (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo ENUM('archivo', 'enlace') NOT NULL,
    contenido VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabla de mensajes
CREATE TABLE mensajes (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_remitente INT NOT NULL,
    id_destinatario INT NOT NULL,
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_remitente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de eventos del calendario
CREATE TABLE eventos_calendario (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    tipo ENUM('clase', 'examen', 'entrega', 'evento') NOT NULL,
    id_materia INT,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserciones iniciales

-- Insertar administrador
INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES
('Admin', 'Sistema', 'admin@campus.com', '$2b$10$p0V9hR5KBTWihlc7511C8e7U/pzGFFUK/R.NVdg7EyDE0rQaxEAAO', 'administrador');
-- Password: admin123

-- Insertar profesores
INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES
('María', 'González', 'maria.gonzalez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor'),
('Ana', 'Martínez', 'ana.martinez@campus.com', '$2b$10$juysL.tLgrtgj0eiA1ktE.ovDVl6csjrC60LuHrpKd7Fd5MI3lfpC', 'profesor');
-- Password: profe123

-- Insertar estudiantes
INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES
('Juan', 'Pérez', 'juan.perez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante'),
('Laura', 'Fernández', 'laura.fernandez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante'),
('Pedro', 'Sánchez', 'pedro.sanchez@estudiante.com', '$2b$10$F9kXjMiBwo1/2WoRO2y3IeqsGyG48Jh4HzU/3zaqr5oF5fC//6l8y', 'estudiante');
-- Password: estudiante123

-- Insertar carreras
INSERT INTO carreras (nombre, descripcion, duracion_anios) VALUES
('Ingeniería en Sistemas', 'Carrera enfocada en desarrollo de software y sistemas', 5),
('Licenciatura en Administración', 'Carrera de gestión empresarial y administración', 4),
('Tecnicatura en Programación', 'Carrera técnica en desarrollo de software', 3);

-- Insertar materias
INSERT INTO materias (nombre, descripcion, id_carrera, id_profesor, cuatrimestre, anio_carrera, inscripcion_habilitada, fecha_inicio_inscripcion, fecha_fin_inscripcion) VALUES
('Programación I', 'Fundamentos de programación', 1, 2, 1, 1, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Base de Datos', 'Diseño y gestión de bases de datos', 1, 3, 2, 2, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Desarrollo Web', 'Creación de aplicaciones web', 1, 4, 1, 3, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Matemática I', 'Álgebra y cálculo', 1, 2, 1, 1, FALSE, NULL, NULL),
('Administración General', 'Fundamentos de administración', 2, 3, 1, 1, FALSE, NULL, NULL);

-- Verify the data was inserted
SELECT 'Database setup completed successfully!' AS result;