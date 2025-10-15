import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Profesor.css';

const Calificar = () => {
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        // Get user info to filter by professor ID
        const profile = await api.getProfile();
        const profesorId = profile.usuario.id_usuario;
        
        console.log('=== CARGAR MATERIAS PARA CALIFICAR ===');
        console.log('Profesor ID:', profesorId);
        
        // CAMBIO: Usar getProfesorMaterias en lugar de getMaterias
        const response = await api.getProfesorMaterias(profesorId);
        const materiasData = response.materias || response;
        
        console.log('Materias cargadas:', materiasData);
        setMaterias(Array.isArray(materiasData) ? materiasData : []);
        
        // If there's only one materia, select it by default
        if (Array.isArray(materiasData) && materiasData.length === 1) {
          setSelectedMateria(materiasData[0].id_materia);
        }
      } catch (err) {
        console.error('Error al cargar materias:', err);
        toast.error(err.message || 'Error al cargar las materias');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  useEffect(() => {
    if (selectedMateria) {
      fetchEstudiantes(selectedMateria);
    } else {
      setEstudiantes([]);
    }
  }, [selectedMateria]);

  const fetchEstudiantes = async (materiaId) => {
    setLoading(true);
    
    try {
      console.log('=== CARGAR ESTUDIANTES PARA CALIFICAR ===');
      console.log('Materia ID:', materiaId);
      
      // CAMBIO: Usar endpoint real en lugar de mock data
      const response = await api.getEstudiantesPorMateria(materiaId);
      
      console.log('Respuesta API:', response);
      
      // Asegurar que obtenemos un array
      let estudiantesData = [];
      if (Array.isArray(response)) {
        estudiantesData = response;
      } else if (response && Array.isArray(response.estudiantes)) {
        estudiantesData = response.estudiantes;
      }
      
      console.log('Estudiantes obtenidos:', estudiantesData);
      
      // Add editable fields to each student
      const estudiantesWithEdit = estudiantesData.map(est => ({
        ...est,
        editEstado: est.estado,
        editNota: est.nota_final
      }));
      
      setEstudiantes(estudiantesWithEdit);
    } catch (err) {
      console.error('Error al cargar los estudiantes:', err);
      toast.error('Error al cargar los estudiantes');
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (index, newEstado) => {
    const updatedEstudiantes = [...estudiantes];
    updatedEstudiantes[index].editEstado = newEstado;
    setEstudiantes(updatedEstudiantes);
  };

  const handleNotaChange = (index, newNota) => {
    // Validate nota (0-10)
    if (newNota === '' || (newNota >= 0 && newNota <= 10)) {
      const updatedEstudiantes = [...estudiantes];
      updatedEstudiantes[index].editNota = newNota === '' ? null : parseFloat(newNota);
      setEstudiantes(updatedEstudiantes);
    }
  };

  const handleGuardar = async (index) => {
    const estudiante = estudiantes[index];
    
    // Validate nota
    if (estudiante.editNota !== null && (estudiante.editNota < 0 || estudiante.editNota > 10)) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }
    
    try {
      // Guardar en la BD
      await api.actualizarCalificacion(
        selectedMateria, 
        estudiante.id_estudiante,
        {
          estado: estudiante.editEstado,
          nota_final: estudiante.editNota
        }
      );
      
      toast.success(`Cambios guardados para ${estudiante.nombre} ${estudiante.apellido}`);
      
      // Update the original values
      const updatedEstudiantes = [...estudiantes];
      updatedEstudiantes[index].estado = updatedEstudiantes[index].editEstado;
      updatedEstudiantes[index].nota_final = updatedEstudiantes[index].editNota;
      setEstudiantes(updatedEstudiantes);
    } catch (err) {
      console.error('Error al guardar:', err);
      toast.error(err.message || 'Error al guardar los cambios');
    }
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'aprobado': return 'status-badge approved';
      case 'desaprobado': return 'status-badge failed';
      case 'cursando': return 'status-badge active';
      default: return 'status-badge';
    }
  };

  if (loading && materias.length === 0) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="calificar-container">
      <h2>Calificar Estudiantes</h2>
      <p className="subtitle">Calificar trabajos y exámenes</p>
      
      <div className="materia-selector">
        <label htmlFor="materia">Seleccionar Materia:</label>
        <select 
          id="materia"
          value={selectedMateria} 
          onChange={(e) => setSelectedMateria(Number(e.target.value))}
          className="materia-select"
        >
          <option value="">-- Seleccione una materia --</option>
          {materias.map((materia) => (
            <option key={materia.id_materia} value={materia.id_materia}>
              {materia.nombre}
            </option>
          ))}
        </select>
      </div>
      
      {selectedMateria && (
        <div className="estudiantes-table-container">
          <table className="estudiantes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Nota Final</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No hay estudiantes inscritos en esta materia
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante, index) => (
                  <tr key={estudiante.id_estudiante}>
                    <td>{estudiante.nombre} {estudiante.apellido}</td>
                    <td>{estudiante.email}</td>
                    <td>
                      <select 
                        value={estudiante.editEstado}
                        onChange={(e) => handleEstadoChange(index, e.target.value)}
                        className="estado-select"
                      >
                        <option value="cursando">Cursando</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="desaprobado">Desaprobado</option>
                        <option value="activo">Activo</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={estudiante.editNota || ''}
                        onChange={(e) => handleNotaChange(index, e.target.value)}
                        className="nota-input"
                        placeholder="0-10"
                      />
                    </td>
                    <td>
                      <button 
                        className="btn-primary"
                        onClick={() => handleGuardar(index)}
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {!selectedMateria && (
        <div className="no-materia-selected">
          <p>Por favor seleccione una materia para ver los estudiantes.</p>
        </div>
      )}
    </div>
  );
};

export default Calificar;