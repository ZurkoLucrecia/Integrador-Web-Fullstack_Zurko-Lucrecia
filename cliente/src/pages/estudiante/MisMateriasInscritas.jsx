import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Estudiante.css';

const MisMateriasInscritas = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMateriasInscritas();
  }, []);

  const fetchMateriasInscritas = async () => {
    try {
      setLoading(true);
      const response = await api.getMateriasInscritas();
      setMaterias(response || []);
    } catch (err) {
      console.error('Error al cargar materias inscritas:', err);
      toast.error(err.message || 'Error al cargar las materias inscritas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      toast.success('¡Sesión cerrada exitosamente!');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'estado-badge aprobado';
      case 'desaprobado':
        return 'estado-badge desaprobado';
      case 'cursando':
        return 'estado-badge cursando';
      default:
        return 'estado-badge';
    }
  };

  if (loading) {
    return (
      <div className="calificaciones-container">
        <div className="loading">Cargando materias inscritas...</div>
      </div>
    );
  }

  return (
    <div className="calificaciones-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Mis Materias Inscritas</h1>
          <p className="subtitle">Materias en las que estás actualmente inscrito</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Cerrar Sesión
        </button>
      </div>

      {materias.length === 0 ? (
        <div className="empty-state">
          <h3>No estás inscrito en ninguna materia</h3>
          <p>Actualmente no tienes materias inscritas.</p>
          <button 
            onClick={() => navigate('/estudiante/inscripcion')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Inscribirme en materias
          </button>
        </div>
      ) : (
        <div className="calificaciones-tabla-container">
          <table className="calificaciones-tabla">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Profesor</th>
                <th>Carrera</th>
                <th>Estado</th>
                <th>Horario</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia) => (
                <tr key={materia.id_materia}>
                  <td className="materia-nombre">{materia.nombre}</td>
                  <td>{materia.nombre_profesor} {materia.apellido_profesor}</td>
                  <td>{materia.nombre_carrera}</td>
                  <td>
                    <span className={getEstadoBadgeClass(materia.estado)}>
                      {materia.estado}
                    </span>
                  </td>
                  <td>{materia.horario || 'No especificado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisMateriasInscritas;