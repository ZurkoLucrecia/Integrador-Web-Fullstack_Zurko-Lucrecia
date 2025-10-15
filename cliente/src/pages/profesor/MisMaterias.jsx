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
    console.log('=== COMPONENTE MONTADO O ACTUALIZADO ===');
    console.log('Estado de materias:', materias);
    console.log('Estado de estudiantes:', estudiantes);
    console.log('Estado de materia seleccionada:', selectedMateria);
    
    const fetchMaterias = async () => {
      try {
        // Obtener información del usuario para filtrar por ID de profesor
        const profile = await api.getProfile();
        const profesorId = profile.usuario.id_usuario;
        
        console.log('=== CARGAR MATERIAS DEL PROFESOR ===');
        console.log('ID Profesor:', profesorId);
        
        // Obtener materias para este profesor - AHORA USA EL ENDPOINT CORRECTO
        const response = await api.getProfesorMaterias(profesorId);
        const materiasData = response.materias || response;
        
        console.log('Materias cargadas:', materiasData);
        setMaterias(Array.isArray(materiasData) ? materiasData : []);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        toast.error(err.message || 'Error al cargar las materias');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const handleVerEstudiantes = async (materia) => {
    try {
      console.log('=== VER ESTUDIANTES ===');
      console.log('Materia seleccionada:', materia.nombre, '(ID:', materia.id_materia, ')');
      
      // Registrar el ID que se envía a la API
      console.log('ID Materia enviado a la API:', materia.id_materia);
      
      // Limpiar datos de estudiantes anteriores inmediatamente
      setEstudiantes([]);
      setSelectedMateria(materia);
      setLoading(true);
      
      // NUEVO: Llamar al endpoint para obtener estudiantes de esta materia
      const response = await api.getEstudiantesPorMateria(materia.id_materia);
      console.log('Respuesta API estudiantes:', response);
      
      // Asegurarse de que estamos trabajando con un array
      let estudiantesData = [];
      if (Array.isArray(response)) {
        estudiantesData = response;
      } else if (response && Array.isArray(response.estudiantes)) {
        estudiantesData = response.estudiantes;
      }
      
      console.log('Estudiantes procesados:', estudiantesData);
      
      setEstudiantes(estudiantesData);
      setShowModal(true);
    } catch (err) {
      console.error('Error al cargar los estudiantes:', err);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    console.log('=== CERRANDO MODAL ===');
    setShowModal(false);
    setSelectedMateria(null);
    setEstudiantes([]);
    console.log('Estado de estudiantes limpiado');
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'aprobado': return 'status-badge approved';
      case 'desaprobado': return 'status-badge failed';
      case 'cursando': return 'status-badge active';
      default: return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
                {/* AHORA MUESTRA EL CONTADOR CORRECTO */}
                <p><strong>Estudiantes inscritos:</strong> {materia.estudiantes_inscritos || 0}</p>
                {materia.fecha_inicio_cursada && (
                  <>
                    <p><strong>Cursada:</strong> {formatDate(materia.fecha_inicio_cursada)} - {formatDate(materia.fecha_fin_cursada)}</p>
                  </>
                )}
              </div>
              <div className="materia-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleVerEstudiantes(materia)}
                >
                  Ver Estudiantes ({materia.estudiantes_inscritos || 0})
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

      {/* Modal para lista de estudiantes */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Estudiantes en {selectedMateria?.nombre}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="loading">Cargando estudiantes...</div>
              ) : (
                <>
                  <p>Cantidad de estudiantes: {estudiantes.length}</p>
                  <p>ID de materia seleccionada: {selectedMateria?.id_materia}</p>
                  {estudiantes.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No hay estudiantes inscritos en esta materia
                    </p>
                  ) : (
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
                          <tr key={estudiante.id_estudiante}>
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
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisMaterias;