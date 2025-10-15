import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Estudiante.css';

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const data = await api.getCalificaciones();
      setCalificaciones(data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar las calificaciones');
    } finally {
      setLoading(false);
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

  const getNotaColor = (nota) => {
    if (!nota) return '#6c757d';
    if (nota >= 7) return '#28a745';
    if (nota >= 4) return '#ffc107';
    return '#dc3545';
  };

  const calcularPromedio = () => {
    const notasValidas = calificaciones.filter(c => c.nota_final && c.estado === 'aprobado');
    if (notasValidas.length === 0) return 0;
    const suma = notasValidas.reduce((acc, c) => acc + parseFloat(c.nota_final), 0);
    return (suma / notasValidas.length).toFixed(2);
  };

  const contarAprobadas = () => {
    return calificaciones.filter(c => c.estado === 'aprobado').length;
  };

  const contarDesaprobadas = () => {
    return calificaciones.filter(c => c.estado === 'desaprobado').length;
  };

  const contarCursando = () => {
    return calificaciones.filter(c => c.estado === 'cursando').length;
  };

  if (loading) {
    return (
      <div className="calificaciones-container">
        <div className="loading">Cargando calificaciones...</div>
      </div>
    );
  }

  return (
    <div className="calificaciones-container">
      <div className="calificaciones-header">
        <h1>Mis Calificaciones</h1>
        <p className="subtitle">Historial académico y notas finales</p>
      </div>

      {/* Estadísticas Generales */}
      <div className="stats-grid">
        <div className="stat-card promedio">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Promedio General</h3>
            <p className="stat-value">{calcularPromedio()}</p>
          </div>
        </div>

        <div className="stat-card aprobadas">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>Materias Aprobadas</h3>
            <p className="stat-value">{contarAprobadas()}</p>
          </div>
        </div>

        <div className="stat-card desaprobadas">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <h3>Materias Desaprobadas</h3>
            <p className="stat-value">{contarDesaprobadas()}</p>
          </div>
        </div>

        <div className="stat-card cursando">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Cursando Actualmente</h3>
            <p className="stat-value">{contarCursando()}</p>
          </div>
        </div>
      </div>

      {/* Lista de Calificaciones */}
      {calificaciones.length === 0 ? (
        <div className="empty-state">
          <h3>No hay calificaciones disponibles</h3>
          <p>Aún no tienes materias calificadas.</p>
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
                <th>Nota Final</th>
                <th>Cuatrimestre</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.map((cal) => (
                <tr key={cal.id_inscripcion || cal.id_materia}>
                  <td className="materia-nombre">{cal.nombre}</td>
                  <td>{cal.nombre_profesor} {cal.apellido_profesor}</td>
                  <td>{cal.nombre_carrera}</td>
                  <td>
                    <span className={getEstadoBadgeClass(cal.estado)}>
                      {cal.estado}
                    </span>
                  </td>
                  <td>
                    {cal.nota_final ? (
                      <span 
                        className="nota-value"
                        style={{ 
                          color: getNotaColor(cal.nota_final),
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      >
                        {cal.nota_final}
                      </span>
                    ) : (
                      <span style={{ color: '#6c757d' }}>Sin calificar</span>
                    )}
                  </td>
                  <td>{cal.cuatrimestre}° - {cal.anio_carrera}° año</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Calificaciones;