import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Admin.css';

const GestionMaterias = () => {
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    id_carrera: '',
    id_profesor: '',
    cuatrimestre: '',
    anio_carrera: ''
  });
  const [profesores, setProfesores] = useState([]);

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

    const fetchProfesores = async () => {
      try {
        const response = await api.getUsuarios({ rol: 'profesor' });
        const data = response.usuarios || response;
        setProfesores(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('Error al cargar los profesores: ' + err.message);
      }
    };

    fetchCarreras();
    fetchProfesores();
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
      const response = await api.getMaterias({ id_carrera });
      const data = response.materias || response;
      setMaterias(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Error al cargar las materias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMateria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      id_carrera: selectedCarrera || '',
      id_profesor: '',
      cuatrimestre: '',
      anio_carrera: ''
    });
    setShowModal(true);
  };

  const handleEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      nombre: materia.nombre || '',
      descripcion: materia.descripcion || '',
      id_carrera: materia.id_carrera || '',
      id_profesor: materia.id_profesor || '',
      cuatrimestre: materia.cuatrimestre || '',
      anio_carrera: materia.anio_carrera || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMateria(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos
    if (!formData.nombre || !formData.id_carrera || !formData.cuatrimestre || !formData.anio_carrera) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      if (editingMateria) {
        // Actualizar materia existente
        await api.updateMateria(editingMateria.id_materia, formData);
        toast.success('Materia actualizada exitosamente');
      } else {
        // Crear nueva materia
        await api.createMateria(formData);
        toast.success('Materia creada exitosamente');
      }
      
      // Recargar materias
      await fetchMaterias(selectedCarrera);
      handleCloseModal();
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    }
  };

  const handleDelete = async (materia) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar la materia "${materia.nombre}"?`)) {
      return;
    }

    try {
      await api.deleteMateria(materia.id_materia);
      toast.success('Materia eliminada exitosamente');
      await fetchMaterias(selectedCarrera);
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  if (loading && carreras.length === 0) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="content">
        <div className="page-header">
          <h1>Gestión de Materias</h1>
          <p className="page-subtitle">
            Administre las materias y asígnelas a carreras.
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
          
          {selectedCarrera && (
            <button className="btn-primary" onClick={handleCreate}>
              Crear Materia
            </button>
          )}
        </div>
        
        {selectedCarrera && (
          <div className="tabla-container">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Profesor</th>
                  <th>Cuatrimestre</th>
                  <th>Año</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.id_materia}>
                    <td>{materia.nombre}</td>
                    <td>{materia.descripcion || '-'}</td>
                    <td>{materia.nombre_profesor ? `${materia.nombre_profesor} ${materia.apellido_profesor}` : 'Sin asignar'}</td>
                    <td>{materia.cuatrimestre}</td>
                    <td>{materia.anio_carrera}</td>
                    <td>
                      <button 
                        className="btn-editar"
                        onClick={() => handleEdit(materia)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleDelete(materia)}
                      >
                        Eliminar
                      </button>
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
        
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingMateria ? 'Editar Materia' : 'Crear Nueva Materia'}</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="id_carrera">Carrera *</label>
                  <select
                    id="id_carrera"
                    name="id_carrera"
                    value={formData.id_carrera}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  >
                    <option value="">-- Seleccione una carrera --</option>
                    {carreras.map((carrera) => (
                      <option key={carrera.id_carrera} value={carrera.id_carrera}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="id_profesor">Profesor</label>
                  <select
                    id="id_profesor"
                    name="id_profesor"
                    value={formData.id_profesor}
                    onChange={handleFormChange}
                    className="form-control"
                  >
                    <option value="">-- Sin asignar --</option>
                    {profesores
                      .filter(prof => prof.rol === 'profesor') // Ensure only professors are shown
                      .map((profesor) => (
                        <option key={profesor.id_usuario} value={profesor.id_usuario}>
                          {profesor.nombre} {profesor.apellido}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cuatrimestre">Cuatrimestre *</label>
                    <input
                      type="number"
                      id="cuatrimestre"
                      name="cuatrimestre"
                      value={formData.cuatrimestre}
                      onChange={handleFormChange}
                      className="form-control"
                      min="1"
                      max="3"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="anio_carrera">Año de Carrera *</label>
                    <input
                      type="number"
                      id="anio_carrera"
                      name="anio_carrera"
                      value={formData.anio_carrera}
                      onChange={handleFormChange}
                      className="form-control"
                      min="1"
                      max="5"
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingMateria ? 'Actualizar' : 'Crear'} Materia
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

export default GestionMaterias;