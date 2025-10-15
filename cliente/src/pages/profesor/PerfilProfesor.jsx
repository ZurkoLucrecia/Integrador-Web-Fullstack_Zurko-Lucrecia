import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Perfil.css';

const PerfilProfesor = () => {
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    email: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
    especialidad: '',
    titulo_academico: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const response = await api.getProfile();
      const usuario = response.usuario;
      setPerfil({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        especialidad: usuario.especialidad || '',
        titulo_academico: usuario.titulo_academico || ''
      });
    } catch (err) {
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Validación de email
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Validación de teléfono
  const isValidPhone = (phone) => {
    return /^[\+]?[0-9\s\-\(\)]{7,20}$/.test(phone);
  };

  // Validación de campos cuando se pierde el foco
  const handleBlur = (field) => {
    const newErrors = { ...errors };

    if (field === 'nombre') {
      if (!perfil.nombre.trim()) {
        newErrors.nombre = 'El nombre es obligatorio';
      } else if (perfil.nombre.length < 2) {
        newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      } else {
        delete newErrors.nombre;
      }
    }

    if (field === 'apellido') {
      if (!perfil.apellido.trim()) {
        newErrors.apellido = 'El apellido es obligatorio';
      } else if (perfil.apellido.length < 2) {
        newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      } else {
        delete newErrors.apellido;
      }
    }

    if (field === 'email') {
      if (!perfil.email) {
        newErrors.email = 'El email es obligatorio';
      } else if (!isValidEmail(perfil.email)) {
        newErrors.email = 'Ingrese un email válido';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'telefono' && perfil.telefono) {
      if (!isValidPhone(perfil.telefono)) {
        newErrors.telefono = 'Ingrese un teléfono válido';
      } else {
        delete newErrors.telefono;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePerfilForm = () => {
    const newErrors = {};

    if (!perfil.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (perfil.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!perfil.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (perfil.apellido.length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!perfil.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!isValidEmail(perfil.email)) {
      newErrors.email = 'Ingrese un email válido';
    }

    if (perfil.telefono && !isValidPhone(perfil.telefono)) {
      newErrors.telefono = 'Ingrese un teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    
    if (!validatePerfilForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    try {
      await api.updatePerfil(perfil);
      toast.success('Perfil actualizado exitosamente');
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    try {
      await api.cambiarPassword(passwordData);
      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error(err.message || 'Error al cambiar la contraseña');
    }
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <div className="perfil-actions">
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              Editar Perfil
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => {
              setEditMode(false);
              setErrors({});
            }}>
              Cancelar
            </button>
          )}
          <button className="btn-password" onClick={() => setShowPasswordModal(true)}>
            Cambiar Contraseña
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitPerfil} className="perfil-form">
        <div className="form-section">
          <h2>Información Personal</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleInputChange}
                onBlur={() => handleBlur('nombre')}
                disabled={!editMode}
                required
              />
              {errors.nombre && (
                <div className="form-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {errors.nombre}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={perfil.apellido}
                onChange={handleInputChange}
                onBlur={() => handleBlur('apellido')}
                disabled={!editMode}
                required
              />
              {errors.apellido && (
                <div className="form-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {errors.apellido}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={perfil.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                disabled={!editMode}
                required
              />
              {errors.email && (
                <div className="form-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={perfil.fecha_nacimiento}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleInputChange}
                onBlur={() => handleBlur('telefono')}
                disabled={!editMode}
                placeholder="Ej: +54 11 1234-5678"
              />
              {errors.telefono && (
                <div className="form-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {errors.telefono}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={perfil.direccion}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Calle, número, ciudad"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Información Académica</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Título Académico</label>
              <input
                type="text"
                name="titulo_academico"
                value={perfil.titulo_academico}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Ej: Licenciado en..."
              />
            </div>
            <div className="form-group">
              <label>Especialidad</label>
              <input
                type="text"
                name="especialidad"
                value={perfil.especialidad}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Ej: Matemáticas, Programación..."
              />
            </div>
          </div>
        </div>

        {editMode && (
          <div className="form-actions">
            <button type="submit" className="btn-save">
              Guardar Cambios
            </button>
          </div>
        )}
      </form>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="modal-close" onClick={() => {
                setShowPasswordModal(false);
                setErrors({});
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="modal-form">
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {errors.currentPassword && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {errors.currentPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                {errors.newPassword && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {errors.newPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {errors.confirmPassword && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setErrors({});
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilProfesor;