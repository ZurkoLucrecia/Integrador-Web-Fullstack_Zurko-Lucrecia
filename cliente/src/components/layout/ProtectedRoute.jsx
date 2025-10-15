import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthUtils from '../../utils/auth';

const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const location = useLocation();
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = AuthUtils.isAuthenticated();
  
  // Obtener rol del usuario
  const userRole = AuthUtils.getUserRole();

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    // Usuario no está autenticado, mostrar notificación y redirigir al inicio de sesión
    toast.error('Debes iniciar sesión para acceder a esta página');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene el rol requerido (si se especifica)
  if (rolesPermitidos.length > 0 && userRole && !rolesPermitidos.includes(userRole)) {
    // Usuario no tiene el rol requerido, se muestra notificación y se redirige a página no autorizada
    toast.error('No tienes permiso para acceder a esta página');
    return <Navigate to="/sin-permiso" replace />;
  }

  // Usuario está autenticado y tiene el rol requerido (si lo hay), renderizar hijos
  return children;
};

export default ProtectedRoute;