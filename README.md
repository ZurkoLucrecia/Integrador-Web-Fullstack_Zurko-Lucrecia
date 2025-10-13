# Campus Virtual

Campus Virtual es una aplicación web para instituciones educativas que permite gestionar estudiantes, cursos y actividades académicas.

## Estructura del Proyecto

```
campusvirtual/
├── .gitignore
├── docs/
│   ├── README.md
│   ├── VERIFICACIÓN_RÁPIDA.sql
│   └── setup-database.sql
├── scripts/
│   ├── apply-migration-db.js
│   ├── start-all.bat
│   ├── start-backend.bat
│   └── start-frontend.bat
├── cliente/
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Menu.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   └── ui/
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   └── Registro.jsx
│       │   ├── shared/
│       │   │   ├── Dashboard.jsx
│       │   │   └── SinPermiso.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── GestionInscripciones.jsx
│       │   │   └── Usuarios.jsx
│       │   ├── estudiante/
│       │   │   ├── Calificaciones.jsx
│       │   │   ├── Inscripcion.css
│       │   │   ├── Inscripcion.jsx
│       │   │   ├── MisMaterias.jsx
│       │   │   ├── MisMateriasInscritas.jsx
│       │   │   └── PerfilEstudiante.jsx
│       │   └── profesor/
│       │       ├── Calificar.jsx
│       │       ├── Dashboard.jsx
│       │       ├── MisMaterias.jsx
│       │       └── PerfilProfesor.jsx
│       ├── services/
│       │   └── api.js
│       ├── styles/
│       │   ├── base/
│       │   │   └── frontend_styles_materias.css
│       │   ├── components/
│       │   └── pages/
│       │       ├── Admin.css
│       │       ├── Estudiante.css
│       │       ├── Perfil.css
│       │       └── Profesor.css
│       └── utils/
│           └── auth.js
└── servidor/
    ├── package.json
    ├── src/
    │   ├── index.js
    │   ├── config/
    │   │   └── database.js
    │   ├── controllers/
    │   │   ├── admin.controller.js
    │   │   ├── auth.controller.js
    │   │   ├── inscripciones.controller.js
    │   │   ├── materias.controller.js
    │   │   ├── perfil.controller.js
    │   │   ├── profesores.controller.js
    │   │   └── usuarios.controller.js
    │   ├── middleware/
    │   │   └── auth.middleware.js
    │   ├── models/
    │   │   └── materias.model.js
    │   ├── routes/
    │   │   ├── admin.routes.js
    │   │   ├── auth.routes.js
    │   │   ├── inscripciones.routes.js
    │   │   ├── materias.routes.js
    │   │   └── perfil.routes.js
    │   └── uploads/
```

## Arquitectura del Sistema

Campus Virtual sigue una arquitectura cliente-servidor con una API RESTful:

1. **Frontend (Cliente)**: Aplicación React que proporciona la interfaz de usuario
2. **Backend (Servidor)**: API REST construida con Node.js y Express
3. **Base de Datos**: Sistema de gestión de base de datos MySQL

La comunicación entre el frontend y el backend se realiza a través de llamadas HTTP a endpoints RESTful, con autenticación basada en tokens JWT.

## Modelo de Datos

### Usuarios
El sistema maneja tres tipos de usuarios:
- **Estudiantes**: Pueden inscribirse en materias, ver sus calificaciones y gestionar su perfil
- **Profesores**: Pueden gestionar sus materias asignadas y calificar a los estudiantes
- **Administradores**: Tienen acceso completo al sistema para gestionar usuarios, materias y configuraciones

### Carreras
Las carreras representan los programas académicos ofrecidos por la institución, cada una con:
- Nombre y descripción
- Duración en años
- Materias asociadas

### Materias
Las materias son las unidades académicas que componen las carreras:
- Asociadas a una carrera específica
- Asignadas a profesores
- Organizadas por cuatrimestre y año
- Con períodos configurables de inscripción y cursada

### Inscripciones
Las inscripciones representan la relación entre estudiantes y materias:
- Registro de estudiantes inscritos en materias
- Estado de la inscripción (activo, aprobado, desaprobado, cursando)
- Calificaciones finales
- Histórico de inscripciones archivadas por períodos

## Flujo de Trabajo del Sistema

### Autenticación
1. Los usuarios acceden al sistema mediante el formulario de inicio de sesión
2. El sistema verifica las credenciales contra la base de datos
3. Si las credenciales son válidas, se genera un token JWT
4. El token se almacena en el cliente y se incluye en las solicitudes posteriores

### Panel de Control
Una vez autenticados, los usuarios son dirigidos a su panel de control específico:
- **Estudiantes**: Vista de sus materias inscritas, calificaciones y opciones de inscripción
- **Profesores**: Vista de sus materias asignadas y herramientas de calificación
- **Administradores**: Panel de administración con acceso a todas las funcionalidades

### Gestión de Materias
#### Para Estudiantes
1. Los estudiantes pueden ver las materias disponibles para inscripción
2. Pueden inscribirse en materias dentro de los períodos habilitados
3. Pueden cancelar inscripciones mientras el período esté activo
4. Pueden ver sus materias inscritas actuales

#### Para Profesores
1. Los profesores ven sus materias asignadas
2. Pueden acceder a listados de estudiantes inscritos
3. Pueden calificar a los estudiantes con notas finales
4. Pueden ver el historial de sus materias

#### Para Administradores
1. Los administradores pueden crear, editar y eliminar materias
2. Pueden asignar profesores a materias
3. Pueden configurar períodos de inscripción y cursada
4. Pueden gestionar el historial de inscripciones por períodos

### Gestión de Períodos Académicos
El sistema permite configurar períodos académicos para:
1. **Inscripción**: Fechas de inicio y fin para la inscripción en materias
2. **Cursada**: Fechas de inicio y fin para el desarrollo de las materias

Cuando finaliza un período de cursada, los administradores pueden archivar las inscripciones para preparar el próximo período académico, manteniendo un historial completo de todas las inscripciones.

### Gestión de Usuarios
Los administradores pueden:
1. Crear nuevos usuarios (estudiantes, profesores, otros administradores)
2. Editar información de usuarios existentes
3. Asignar carreras a estudiantes
4. Activar o desactivar cuentas de usuario

## Configuración de la Base de Datos

Para configurar la base de datos, ejecute el script [setup-database.sql](file:///d:/Usuario/Documents/PROGRAMACI%C3%93N/campusvirtual/docs/setup-database.sql) en su cliente MySQL.

## Usuarios de Prueba

La base de datos incluye usuarios predefinidos para diferentes roles:

### Administrador
- **Email**: admin@campus.com
- **Contraseña**: admin123
- **Rol**: administrador

### Profesores
1. **María González**
   - **Email**: maria.gonzalez@campus.com
   - **Contraseña**: profe123
   - **Rol**: profesor

2. **Carlos Rodríguez**
   - **Email**: carlos.rodriguez@campus.com
   - **Contraseña**: profe123
   - **Rol**: profesor

3. **Ana Martínez**
   - **Email**: ana.martinez@campus.com
   - **Contraseña**: profe123
   - **Rol**: profesor

### Estudiantes
1. **Juan Pérez**
   - **Email**: juan.perez@estudiante.com
   - **Contraseña**: estudiante123
   - **Rol**: estudiante

2. **Laura Fernández**
   - **Email**: laura.fernandez@estudiante.com
   - **Contraseña**: estudiante123
   - **Rol**: estudiante

3. **Pedro Sánchez**
   - **Email**: pedro.sanchez@estudiante.com
   - **Contraseña**: estudiante123
   - **Rol**: estudiante

## Ejecutar la Aplicación

### Iniciar el Servidor Backend
```bash
cd servidor
npm start
```

### Iniciar el Cliente Frontend
```bash
cd cliente
npm run dev
```

### Iniciar Ambos Servicios
```bash
./scripts/start-all.bat
```

## Tecnologías Utilizadas

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **Base de Datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Otros**: React Hooks, REST API, Axios, React Toastify