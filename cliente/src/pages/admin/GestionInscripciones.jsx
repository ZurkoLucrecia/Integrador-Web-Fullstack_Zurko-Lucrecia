import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Admin.css';

const GestionInscripciones = () => {
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMateria, setEditingMateria] = useState(null);
  const [formData, setFormData] = useState({
    inscripcion_habilitada: false,
    fecha_inicio_inscripcion: '',
    fecha_fin_inscripcion: '',
    fecha_inicio_cursada: '',
    fecha_fin_cursada: ''
  });

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        const response = await api.getCarreras();
        const data = response.carreras || response;
        setCarreras(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('Error al cargar las carreras: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);

  useEffect(() => {
    if (selectedCarrera) {
      fetchMaterias(selectedCarrera);
    } else {
      setMaterias([]);
    }
  }, [selectedCarrera]);

  const fetchMaterias = async (id_carrera) => {
    setLoading(true);
    try {
      const response = await api.getMateriasPorCarrera(id_carrera);
      const data = response.materias || response;
      setMaterias(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Error al cargar las materias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = (materia) => {
    setEditingMateria(materia);
    const startInscripcion = materia.fecha_inicio_inscripcion 
      ? materia.fecha_inicio_inscripcion.replace(' ', 'T').substring(0, 16)
      : '';
    const endInscripcion = materia.fecha_fin_inscripcion 
      ? materia.fecha_fin_inscripcion.replace(' ', 'T').substring(0, 16)
      : '';
    const startCursada = materia.fecha_inicio_cursada 
      ? materia.fecha_inicio_cursada.replace(' ', 'T').substring(0, 16)
      : '';
    const endCursada = materia.fecha_fin_cursada 
      ? materia.fecha_fin_cursada.replace(' ', 'T').substring(0, 16)
      : '';
    
    setFormData({
      inscripcion_habilitada: materia.inscripcion_habilitada || false,
      fecha_inicio_inscripcion: startInscripcion,
      fecha_fin_inscripcion: endInscripcion,
      fecha_inicio_cursada: startCursada,
      fecha_fin_cursada: endCursada
    });
  };

  const handleCancelEdit = () => {
    setEditingMateria(null);
    setFormData({
      inscripcion_habilitada: false,
      fecha_inicio_inscripcion: '',
      fecha_fin_inscripcion: '',
      fecha_inicio_cursada: '',
      fecha_fin_cursada: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const datosEnviar = {
      inscripcion_habilitada: formData.inscripcion_habilitada,
      fecha_inicio_inscripcion: formData.fecha_inicio_inscripcion || null,
      fecha_fin_inscripcion: formData.fecha_fin_inscripcion || null,
      fecha_inicio_cursada: formData.fecha_inicio_cursada || null,
      fecha_fin_cursada: formData.fecha_fin_cursada || null
    };
    
    try {
      await api.actualizarPeriodoInscripcion(editingMateria.id_materia, datosEnviar);
      toast.success('Períodos actualizados exitosamente');
      await fetchMaterias(selectedCarrera);
      handleCancelEdit();
    } catch (err) {
      toast.error('Error al actualizar: ' + err.message);
    }
  };

  const handleLimpiarInscripciones = async (materia) => {
    if (!window.confirm(`¿Está seguro de que desea archivar los inscritos de "${materia.nombre}" y preparar la materia para el próximo período?`)) {
      return;
    }

    try {
      await api.limpiarInscripciones(materia.id_materia);
      toast.success('Inscritos archivados. Materia preparada para nuevo período.');
      await fetchMaterias(selectedCarrera);
    } catch (err) {
      toast.error('Error al limpiar inscripciones: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No establecido';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isPeriodActive = (materia) => {
    if (!materia.inscripcion_habilitada) return false;
    const now = new Date();
    const startDate = materia.fecha_inicio_inscripcion ? new Date(materia.fecha_inicio_inscripcion) : null;
    const endDate = materia.fecha_fin_inscripcion ? new Date(materia.fecha_fin_inscripcion) : null;
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    return true;
  };

  if (loading && carreras.length === 0) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="content">
        <div className="page-header">
          <h1>Períodos de Inscripción y Cursada</h1>
          <p className="page-subtitle">
            Configure los períodos de inscripción y cursada para cada materia.
          </p>
        </div>
        
        <div className="filtros-container">
          <div className="form-group">
            <label htmlFor="carrera">Seleccionar Carrera:</label>
            <select 
              id="carrera"
              value={selectedCarrera} 
              onChange={(e) => setSelectedCarrera(e.target.value)}
              className="form-control"
            >
              <option value="">-- Seleccione una carrera --</option>
              {carreras.map((carrera) => (
                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedCarrera && (
          <div className="tabla-container">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Profesor</th>
                  <th>Cuatrimestre</th>
                  <th>Año</th>
                  <th>Estado</th>
                  <th>Inscritos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.id_materia}>
                    <td>{materia.nombre}</td>
                    <td>{materia.nombre_profesor} {materia.apellido_profesor}</td>
                    <td>{materia.cuatrimestre}</td>
                    <td>{materia.anio_carrera}</td>
                    <td>
                      <span className={`badge ${isPeriodActive(materia) ? 'badge-success' : 'badge-secondary'}`}>
                        {materia.inscripcion_habilitada ? 'Habilitada' : 'Deshabilitada'}
                      </span>
                    </td>
                    <td>{materia.estudiantes_inscritos || 0}</td>
                    <td>
                      <button 
                        className="btn-editar"
                        onClick={() => handleConfigure(materia)}
                      >
                        Configurar
                      </button>
                      {materia.estudiantes_inscritos > 0 && (
                        <button 
                          className="btn-limpiar"
                          onClick={() => handleLimpiarInscripciones(materia)}
                          title="Archivar inscritos y preparar para nuevo período"
                        >
                          Limpiar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!selectedCarrera && (
          <div className="empty-state">
            <p>Por favor seleccione una carrera para ver sus materias.</p>
          </div>
        )}
        
        {editingMateria && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Configurar Períodos: {editingMateria.nombre}</h2>
                <button className="modal-close" onClick={handleCancelEdit}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                
                <div className="form-section inscripciones-cursada-section">
                  <h3>Período de Inscripción</h3>
                  
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="inscripcion_habilitada"
                      name="inscripcion_habilitada"
                      checked={formData.inscripcion_habilitada}
                      onChange={handleFormChange}
                    />
                    <label htmlFor="inscripcion_habilitada">Habilitar inscripción</label>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_inicio_inscripcion">Fecha de Inicio Inscripción:</label>
                    <input
                      type="datetime-local"
                      id="fecha_inicio_inscripcion"
                      name="fecha_inicio_inscripcion"
                      value={formData.fecha_inicio_inscripcion}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_fin_inscripcion">Fecha de Fin Inscripción:</label>
                    <input
                      type="datetime-local"
                      id="fecha_fin_inscripcion"
                      name="fecha_fin_inscripcion"
                      value={formData.fecha_fin_inscripcion}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-section inscripciones-cursada-section">
                  <h3>Período de Cursada</h3>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_inicio_cursada">Fecha de Inicio Cursada:</label>
                    <input
                      type="datetime-local"
                      id="fecha_inicio_cursada"
                      name="fecha_inicio_cursada"
                      value={formData.fecha_inicio_cursada}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_fin_cursada">Fecha de Fin Cursada:</label>
                    <input
                      type="datetime-local"
                      id="fecha_fin_cursada"
                      name="fecha_fin_cursada"
                      value={formData.fecha_fin_cursada}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-hint">
                    <small>Cuando finalice el período de cursada, podrá archivar los inscritos para preparar el próximo período.</small>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionInscripciones;