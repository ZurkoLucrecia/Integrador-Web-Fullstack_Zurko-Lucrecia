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
        
        // Fetch materias for this professor
        const data = await api.getMaterias({ id_profesor: profesorId });
        setMaterias(data);
        
        // If there's only one materia, select it by default
        if (data.length === 1) {
          setSelectedMateria(data[0].id_materia);
        }
      } catch (err) {
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
      // This would need a backend endpoint to get students by materia
      // For now, we'll use mock data
      const mockEstudiantes = [
        { id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@estudiante.com', estado: 'cursando', nota_final: null },
        { id_usuario: 2, nombre: 'Laura', apellido: 'Fernández', email: 'laura.fernandez@estudiante.com', estado: 'cursando', nota_final: 7.5 },
        { id_usuario: 3, nombre: 'Pedro', apellido: 'Sánchez', email: 'pedro.sanchez@estudiante.com', estado: 'cursando', nota_final: null }
      ];
      
      // Add editable fields to each student
      const estudiantesWithEdit = mockEstudiantes.map(est => ({
        ...est,
        editEstado: est.estado,
        editNota: est.nota_final
      }));
      
      setEstudiantes(estudiantesWithEdit);
    } catch (err) {
      toast.error('Error al cargar los estudiantes');
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
      // This would call the backend API to save the changes
      // For now, we'll just simulate success
      toast.success(`Cambios guardados para ${estudiante.nombre} ${estudiante.apellido}`);
      
      // Update the original values
      const updatedEstudiantes = [...estudiantes];
      updatedEstudiantes[index].estado = updatedEstudiantes[index].editEstado;
      updatedEstudiantes[index].nota_final = updatedEstudiantes[index].editNota;
      setEstudiantes(updatedEstudiantes);
    } catch (err) {
      toast.error('Error al guardar los cambios');
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
              {estudiantes.map((estudiante, index) => (
                <tr key={estudiante.id_usuario}>
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
              ))}
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