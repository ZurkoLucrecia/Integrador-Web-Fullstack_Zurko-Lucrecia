import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthUtils from '../../utils/auth';
import '../../styles/pages/Estudiante.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = AuthUtils.getUserRole();

  useEffect(() => {
    // Redirigir al panel específico del rol
    if (userRole === 'profesor') {
      navigate('/profesor/dashboard');
    } else if (userRole === 'administrador') {
      navigate('/admin/dashboard');
    }
    // Los estudiantes permanecen en este panel
  }, [userRole, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Si el usuario es profesor o administrador, no mostrar estp
  if (userRole === 'profesor' || userRole === 'administrador') {
    return <div className="loading">Redirigiendo...</div>;
  }

  const dashboardOptions = [
    {
      title: 'Mis Materias',
      description: 'Accede a tus materias inscritas',
      path: '/estudiante/mis-materias',
      color: 'var(--primary)'
    },
    {
      title: 'Inscripción',
      description: 'Inscríbete en nuevas materias',
      path: '/estudiante/inscripcion',
      color: 'var(--secondary)'
    },
    {
      title: 'Calificaciones',
      description: 'Consulta tus calificaciones',
      path: '/estudiante/calificaciones',
      color: 'var(--success)'
    },
    {
      title: 'Mi Perfil',
      description: 'Actualiza tu información personal',
      path: '/estudiante/perfil',
      color: 'var(--accent)'
    }
  ];

  return (
    <div className="page-container">
      <div className="content">
        <div className="page-header">
          <div>
            <h1>¡Bienvenido Estudiante!</h1>
            <p className="page-subtitle">Accede a las diferentes secciones</p>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        <div className="dashboard-grid">
          {dashboardOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => navigate(option.path)}
              className="dashboard-card"
              style={{
                borderTop: `5px solid ${option.color}`
              }}
            >
              <h2>{option.title}</h2>
              <p>{option.description}</p>
              <button className="btn-primary">
                Acceder
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;