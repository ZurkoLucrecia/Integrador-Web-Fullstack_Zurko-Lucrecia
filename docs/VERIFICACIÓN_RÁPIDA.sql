-- Script de verificación rápida

-- Ejecuta esto para verificar que todo esté configurado

USE campus_virtual;

-- 3. Verificar estudiantes con carrera
SELECT '=== ESTUDIANTES CON CARRERA ===' as '';

SELECT u.id_usuario, u.nombre, u.apellido, u.id_carrera, c.nombre as carrera
FROM usuarios u
LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
WHERE u.rol = 'estudiante' AND u.activo = TRUE;

-- 4. Verificar materias con carrera
SELECT '=== MATERIAS CON CARRERA ===' as '';

SELECT m.id_materia, m.nombre, m.id_carrera, c.nombre as carrera, m.inscripcion_habilitada
FROM materias m
LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
WHERE m.activo = TRUE;

-- 5. Test: Habilitar inscripción manualmente
SELECT '=== TEST: HABILITAR INSCRIPCIÓN MANUAL ===' as '';

-- Primero deshabilitamos
UPDATE materias SET inscripcion_habilitada = FALSE WHERE id_materia = 1;

-- Ahora habilitamos (simula lo que hace tu código)
UPDATE materias 
SET inscripcion_habilitada = TRUE, 
    fecha_inicio_inscripcion = NULL, 
    fecha_fin_inscripcion = NULL 
WHERE id_materia = 1;

-- Ver resultado
SELECT id_materia, nombre, inscripcion_habilitada FROM materias WHERE id_materia = 1;

SELECT '=== VERIFICACIÓN COMPLETADA ===' as '';