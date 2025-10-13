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

## Mejoras en la Estructura del Proyecto

La estructura del proyecto ha sido reorganizada para mejorar la mantenibilidad y la claridad:

1. **Organización por Funcionalidad**: Los componentes y páginas están organizados por tipo y rol
2. **Separación de Concerns**: Archivos de estilo, componentes y lógica de negocio están claramente separados
3. **Directorios Específicos**: 
   - `assets/` para recursos multimedia
   - `components/layout/` para componentes de diseño
   - `components/ui/` para componentes de interfaz reutilizables
   - `pages/auth/` para páginas de autenticación
   - `pages/shared/` para páginas comunes a todos los roles
   - `styles/base/`, `styles/components/`, `styles/pages/` para una mejor organización de estilos
   - `docs/` para documentación
   - `scripts/` para scripts de utilidad

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

## Características Principales

### Para Estudiantes:
- Inscripción en materias
- Visualización de materias inscritas
- Consulta de calificaciones
- Gestión de perfil personal

### Para Profesores:
- Gestión de materias asignadas
- Calificación de estudiantes
- Visualización de listados de estudiantes
- Gestión de perfil personal

### Para Administradores:
- Gestión de usuarios (estudiantes, profesores, administradores)
- Gestión de inscripciones
- Configuración de períodos de inscripción
- Visualización de estadísticas del sistema

## Tecnologías Utilizadas

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **Base de Datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Otros**: React Hooks, REST API