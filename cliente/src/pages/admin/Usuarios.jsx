import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/pages/Admin.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Datos del formulario para nuevo/edición de usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'estudiante',
    id_carrera: ''
  });
  
  const [carreras, setCarreras] = useState([]);

  useEffect(() => {
    fetchUsuarios();
    fetchCarreras();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsuarios();
      // Handle both cases: array directly or wrapped in object
      setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
    } catch (err) {
      toast.error('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarreras = async () => {
    try {
      const data = await api.getCarreras();
      setCarreras(Array.isArray(data) ? data : data.carreras || []);
    } catch (err) {
      console.error('Error al cargar carreras:', err);
      toast.error('Error al cargar carreras');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await api.deleteUsuario(id);
        toast.success('Usuario eliminado exitosamente');
        fetchUsuarios();
      } catch (err) {
        toast.error('Error al eliminar usuario: ' + err.message);
      }
    }
  };

  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setNewUser({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '', // No mostrar la contraseña existente
      rol: usuario.rol,
      id_carrera: usuario.id_carrera || ''
    });
    setShowUserModal(true);
  };

  // Abrir modal para crear nuevo usuario
  const handleCreateUser = () => {
    setEditingUser(null);
    setNewUser({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'estudiante',
      id_carrera: ''
    });
    setShowUserModal(true);
  };

  // Abrir modal para editar usuario existente
  const handleOpenEditModal = (usuario) => {
    handleEditUser(usuario);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setNewUser({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'estudiante',
      id_carrera: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Actualizar usuario existente
        await api.updateUsuario(editingUser.id_usuario, newUser);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await api.createUsuario(newUser);
        toast.success('Usuario creado exitosamente');
      }
      
      fetchUsuarios();
      handleCloseModal();
    } catch (err) {
      toast.error('Error al guardar usuario: ' + err.message);
    }
  };

  const handleAssignCareer = async (usuario) => {
    try {
      // Aquí normalmente mostrarías un modal para seleccionar carrera
      // Por ahora, simplemente actualizamos el estado local
      console.log('Asignar carrera a usuario:', usuario);
      toast.info('Funcionalidad de asignar carrera en desarrollo');
    } catch (err) {
      toast.error('Error al asignar carrera: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="page-container">
      <div className="content">
        <div className="page-header">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p className="page-subtitle">Administre los usuarios del sistema</p>
          </div>
          <button className="btn-primary" onClick={handleCreateUser}>
            Crear Usuario
          </button>
        </div>
        
        <div className="tabla-container">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Carrera</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>
                    <strong>{usuario.nombre} {usuario.apellido}</strong>
                  </td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`badge badge-${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={usuario.activo ? 'activo' : 'inactivo'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{usuario.nombre_carrera || 'No asignada'}</td>
                  <td className="acciones">
                    <button 
                      className="btn-editar"
                      onClick={() => handleOpenEditModal(usuario)}
                    >
                      Editar
                    </button>
                    {usuario.rol === 'estudiante' && (
                      <button 
                        className="btn-materias"
                        onClick={() => handleAssignCareer(usuario)}
                      >
                        Carrera
                      </button>
                    )}
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleDeleteUser(usuario.id_usuario)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para crear/editar usuario */}
        {showUserModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                <button 
                  className="modal-close" 
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitUser} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={newUser.nombre}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={newUser.apellido}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>{editingUser ? 'Nueva Contraseña' : 'Contraseña'} {editingUser ? '' : '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleFormChange}
                    {...(!editingUser && { required: true })}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      name="rol"
                      value={newUser.rol}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="estudiante">Estudiante</option>
                      <option value="profesor">Profesor</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Carrera</label>
                    <select
                      name="id_carrera"
                      value={newUser.id_carrera}
                      onChange={handleFormChange}
                    >
                      <option value="">-- Sin asignar --</option>
                      {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                          {carrera.nombre}
                        </option>
                      ))}
                    </select>
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
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
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

export default Usuarios;