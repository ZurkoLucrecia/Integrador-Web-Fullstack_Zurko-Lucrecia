import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Inscripcion.css';

function Inscripcion() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        const response = await api.getMateriasDisponibles();
        console.log('Materias disponibles:', response);
        setMaterias(response || []);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        toast.error(err.message || 'Error al cargar las materias disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const handleInscribir = async (materiaId) => {
    try {
      console.log('=== HANDLE INSCRIBIR ===');
      console.log('Materia ID recibido:', materiaId);
      console.log('Tipo de dato:', typeof materiaId);
      
      // Log before calling API
      console.log('Llamando a api.inscribirEnMateria con:', materiaId);
      await api.inscribirEnMateria(materiaId);
      
      toast.success('¡Inscripción realizada con éxito!'); // Mejor mensaje de éxito
      
      // Refresh the list of available subjects
      const response = await api.getMateriasDisponibles();
      setMaterias(response || []);
    } catch (err) {
      console.error('Error al inscribir:', err);
      toast.error(err.message || 'Error al realizar la inscripción. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="inscripcion-container">
        <h2>Inscripción en Materias</h2>
        <div className="loading">Cargando materias disponibles...</div>
      </div>
    );
  }

  return (
    <div className="inscripcion-container">
      <h2>Inscripción en Materias</h2>
      
      <div className="info-text">
        <strong>Importante:</strong> Solo se muestran materias con inscripción habilitada y dentro del período válido.
      </div>
      
      {materias.length === 0 ? (
        <div className="empty-state">
          <h3>No hay materias disponibles</h3>
          <p>En este momento no hay materias disponibles para inscripción.</p>
          <ul>
            <li>Verifica más tarde si se han habilitado nuevos períodos de inscripción</li>
            <li>Contacta al administrador si crees que esto es un error</li>
          </ul>
        </div>
      ) : (
        <div className="materias-grid">
          {console.log('Materias recibidas:', materias)}
          {materias.map((materia) => (
            <div key={materia.id_materia} className="materia-card">
              <h3>{materia.nombre}</h3>
              {materia.descripcion && (
                <p className="materia-descripcion">{materia.descripcion}</p>
              )}
              <div className="materia-info">
                <p><strong>Profesor:</strong> {materia.nombre_profesor} {materia.apellido_profesor}</p>
                <p><strong>Carrera:</strong> {materia.nombre_carrera}</p>
                <p><strong>Horario:</strong> {materia.horario || 'No especificado'}</p>
                {materia.fecha_fin_inscripcion && (
                  <p className="fecha-limite">
                    <strong>Fecha límite de inscripción:</strong> {
                      new Date(materia.fecha_fin_inscripcion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    }
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  console.log('Botón Inscribirse clickeado');
                  console.log('Materia completa:', materia);
                  console.log('ID materia:', materia.id_materia);
                  handleInscribir(materia.id_materia);
                }}
                className="btn-inscribir"
              >
                Inscribirse
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inscripcion;