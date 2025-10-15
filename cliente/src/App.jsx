import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Páginas públicas
import Login from './pages/auth/Login';
// import Registro from './pages/auth/Registro'; // ELIMINADO - Los usuarios son creados solo por administradores

// Páginas compartidas
import Dashboard from './pages/shared/Dashboard';
import SinPermiso from './pages/shared/SinPermiso';

// Páginas de estudiante
import EstudianteDashboard from './pages/estudiante/MisMaterias';
import Inscripcion from './pages/estudiante/Inscripcion';
import MisMateriasInscritas from './pages/estudiante/MisMateriasInscritas';
import Calificaciones from './pages/estudiante/Calificaciones';
import PerfilEstudiante from './pages/estudiante/PerfilEstudiante';

// Páginas de profesor
import ProfesorDashboard from './pages/profesor/Dashboard';
import ProfesorMaterias from './pages/profesor/MisMaterias';
import Calificar from './pages/profesor/Calificar';
import PerfilProfesor from './pages/profesor/PerfilProfesor';

// Páginas de administrador
import AdminDashboard from './pages/admin/AdminDashboard';
import Usuarios from './pages/admin/Usuarios';
import GestionInscripciones from './pages/admin/GestionInscripciones';
import GestionMaterias from './pages/admin/GestionMaterias';

// Componentes
import Menu from './components/layout/Menu';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Estilos
import './styles/base/global-styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Menu />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/sin-permiso" element={<SinPermiso />} />
          
          {/* Rutas de estudiante */}
          <Route path="/estudiante/dashboard" element={
            <ProtectedRoute rolesPermitidos={['estudiante']}>
              <EstudianteDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiante/mis-materias" element={
            <ProtectedRoute rolesPermitidos={['estudiante']}>
              <MisMateriasInscritas />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiante/inscripcion" element={
            <ProtectedRoute rolesPermitidos={['estudiante']}>
              <Inscripcion />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiante/calificaciones" element={
            <ProtectedRoute rolesPermitidos={['estudiante']}>
              <Calificaciones />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiante/perfil" element={
            <ProtectedRoute rolesPermitidos={['estudiante']}>
              <PerfilEstudiante />
            </ProtectedRoute>
          } />
          
          {/* Rutas de profesor */}
          <Route path="/profesor/dashboard" element={
            <ProtectedRoute rolesPermitidos={['profesor']}>
              <ProfesorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profesor/materias" element={
            <ProtectedRoute rolesPermitidos={['profesor']}>
              <ProfesorMaterias />
            </ProtectedRoute>
          } />
          
          <Route path="/profesor/calificar" element={
            <ProtectedRoute rolesPermitidos={['profesor']}>
              <Calificar />
            </ProtectedRoute>
          } />
          
          <Route path="/profesor/perfil" element={
            <ProtectedRoute rolesPermitidos={['profesor']}>
              <PerfilProfesor />
            </ProtectedRoute>
          } />
          
          {/* Rutas de administrador */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute rolesPermitidos={['administrador']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/usuarios" element={
            <ProtectedRoute rolesPermitidos={['administrador']}>
              <Usuarios />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/materias" element={
            <ProtectedRoute rolesPermitidos={['administrador']}>
              <GestionMaterias />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/inscripciones" element={
            <ProtectedRoute rolesPermitidos={['administrador']}>
              <GestionInscripciones />
            </ProtectedRoute>
          } />
          
          {/* Ruta por defecto */}
          <Route path="/" element={<Login />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;