import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/pages/Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      toast.success('¡Sesión cerrada exitosamente!');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const dashboardOptions = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar estudiantes, profesores y otros usuarios del sistema',
      path: '/admin/usuarios',
      color: 'var(--primary)'
    },
    {
      title: 'Períodos de Inscripción',
      description: 'Configurar fechas y habilitar inscripciones para materias',
      path: '/admin/inscripciones',
      color: 'var(--success)'
    }
  ];

  return (
    <div className="page-container">
      <div className="content">
        <div className="page-header">
          <div>
            <h1>Panel de Administración</h1>
            <p className="page-subtitle">Seleccione la opción que desea gestionar</p>
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

export default AdminDashboard;