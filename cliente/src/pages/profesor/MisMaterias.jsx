import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Profesor.css';

const MisMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        // Get user info to filter by professor ID
        const profile = await api.getProfile();
        const profesorId = profile.usuario.id_usuario;
        
        // Fetch materias for this professor
        const data = await api.getMaterias({ id_profesor: profesorId });
        setMaterias(data);
      } catch (err) {
        toast.error(err.message || 'Error al cargar las materias');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const handleVerEstudiantes = async (materia) => {
    try {
      setSelectedMateria(materia);
      // This would need a backend endpoint to get students by materia
      // For now, we'll use mock data
      const mockEstudiantes = [
        { id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@estudiante.com', estado: 'cursando', nota_final: null },
        { id_usuario: 2, nombre: 'Laura', apellido: 'Fernández', email: 'laura.fernandez@estudiante.com', estado: 'aprobado', nota_final: 8.5 },
        { id_usuario: 3, nombre: 'Pedro', apellido: 'Sánchez', email: 'pedro.sanchez@estudiante.com', estado: 'cursando', nota_final: null }
      ];
      setEstudiantes(mockEstudiantes);
      setShowModal(true);
    } catch (err) {
      toast.error('Error al cargar los estudiantes');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMateria(null);
    setEstudiantes([]);
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'aprobado': return 'status-badge approved';
      case 'desaprobado': return 'status-badge failed';
      case 'cursando': return 'status-badge active';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return <div className="loading">Cargando materias...</div>;
  }

  return (
    <div className="profesor-materias-container">
      <h2>Mis Materias</h2>
      <p className="subtitle">Materias que estoy enseñando</p>
      
      {materias.length === 0 ? (
        <div className="no-materias">
          <p>No tiene materias asignadas aún.</p>
        </div>
      ) : (
        <div className="materias-grid">
          {materias.map((materia) => (
            <div key={materia.id_materia} className="materia-card">
              <h3>{materia.nombre}</h3>
              <p className="descripcion">{materia.descripcion}</p>
              <div className="materia-info">
                <p><strong>Carrera:</strong> {materia.nombre_carrera}</p>
                <p><strong>Cuatrimestre:</strong> {materia.cuatrimestre}</p>
                <p><strong>Año:</strong> {materia.anio_carrera}</p>
                <p><strong>Estudiantes:</strong> {materia.estudiantes_inscritos || 0}</p>
              </div>
              <div className="materia-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleVerEstudiantes(materia)}
                >
                  Ver Estudiantes
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => navigate(`/profesor/calificar?materia=${materia.id_materia}`)}
                >
                  Calificar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for students list */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Estudiantes en {selectedMateria?.nombre}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <table className="estudiantes-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id_usuario}>
                      <td>{estudiante.nombre} {estudiante.apellido}</td>
                      <td>{estudiante.email}</td>
                      <td>
                        <span className={getStatusBadgeClass(estudiante.estado)}>
                          {estudiante.estado}
                        </span>
                      </td>
                      <td>{estudiante.nota_final || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisMaterias;