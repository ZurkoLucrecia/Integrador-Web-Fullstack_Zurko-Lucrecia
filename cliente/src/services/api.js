import axios from 'axios';

const API_BASE_URL = '/api';

// Crear instancia de axios con configuración predeterminada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar interceptor de solicitud para incluir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Agregar interceptor de respuesta para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Servidor respondió con estado de error
      console.error('Error de API:', error.response.status, error.response.data);
      return Promise.reject(new Error(error.response.data.error || `¡Error HTTP! estado: ${error.response.status}`));
    } else if (error.request) {
      // Se realizó la solicitud pero no se recibió respuesta
      console.error('Error de red de API:', error.request);
      return Promise.reject(new Error('Error de red. Por favor verifica tu conexión.'));
    } else {
      // Ocurrió algo más
      console.error('Error de API:', error.message);
      return Promise.reject(new Error('Error en la solicitud: ' + error.message));
    }
  }
);

class ApiService {
  constructor() {
    this.client = apiClient;
  }

  // Endpoints de materias
  async getMaterias(filters = {}) {
    const response = await this.client.get('/materias', { params: filters });
    return response.data;
  }

  async getMateriaById(id) {
    const response = await this.client.get(`/materias/${id}`);
    return response.data;
  }

  async createMateria(data) {
    const response = await this.client.post('/materias', data);
    return response.data;
  }

  async updateMateria(id, data) {
    const response = await this.client.put(`/materias/${id}`, data);
    return response.data;
  }

  async deleteMateria(id) {
    const response = await this.client.delete(`/materias/${id}`);
    return response.data;
  }

  // Endpoints de autenticación
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/perfil');
    return response.data;
  }

  // NUEVO: Endpoints de perfil
  async updatePerfil(data) {
    const response = await this.client.put('/perfil', data);
    return response.data;
  }

  async cambiarPassword(data) {
    const response = await this.client.put('/perfil/cambiar-password', data);
    return response.data;
  }

  // Endpoints de administrador - Usuarios
  async getUsuarios(filters = {}) {
    const response = await this.client.get('/admin/usuarios', { params: filters });
    return response.data;
  }

  async createUsuario(data) {
    const response = await this.client.post('/admin/usuarios', data);
    return response.data;
  }

  async updateUsuario(id, data) {
    const response = await this.client.put(`/admin/usuarios/${id}`, data);
    return response.data;
  }

  async deleteUsuario(id) {
    const response = await this.client.delete(`/admin/usuarios/${id}`);
    return response.data;
  }

  // Endpoints de administrador - Profesores y materias
  async getProfesorMaterias(profesorId) {
    const response = await this.client.get(`/admin/profesores/${profesorId}/materias`);
    return response.data;
  }

  async assignProfesorMateria(profesorId, materiaId) {
    const response = await this.client.post(`/admin/profesores/${profesorId}/materias`, { id_materia: materiaId });
    return response.data;
  }

  async removeProfesorMateria(profesorId, materiaId) {
    const response = await this.client.delete(`/admin/profesores/${profesorId}/materias/${materiaId}`);
    return response.data;
  }

  // Endpoints de administrador - Gestión de períodos de inscripción
  async getCarreras() {
    const response = await this.client.get('/admin/carreras');
    return response.data;
  }

  async getMateriasPorCarrera(id_carrera) {
    const response = await this.client.get(`/admin/carreras/${id_carrera}/materias`);
    return response.data;
  }

  async actualizarPeriodoInscripcion(id_materia, data) {
    const response = await this.client.put(`/admin/materias/${id_materia}/periodo-inscripcion`, data);
    return response.data;
  }

  // Endpoints de inscripción de estudiantes
  async inscribirEnMateria(id_materia) {
    const response = await this.client.post('/inscripciones', { id_materia });
    return response.data;
  }

  async getMateriasDisponibles() {
    const response = await this.client.get('/inscripciones/disponibles');
    return response.data;
  }

  async getMateriasInscritas() {
    const response = await this.client.get('/inscripciones');
    return response.data;
  }

  // NUEVO: Obtener calificaciones
  async getCalificaciones() {
    const response = await this.client.get('/inscripciones/calificaciones');
    return response.data;
  }

  async cancelarInscripcion(id_materia) {
    const response = await this.client.delete(`/inscripciones/${id_materia}`);
    return response.data;
  }

  // Endpoints de administrador para asignar carrera
  async asignarCarreraAUsuario(id_usuario, id_carrera) {
    const response = await this.client.put(`/admin/usuarios/${id_usuario}/carrera`, { id_carrera });
    return response.data;
  }

  // Limpiar/archivar inscripciones de una materia
  async limpiarInscripciones(id_materia) {
    const response = await this.client.post(`/admin/materias/${id_materia}/limpiar-inscripciones`);
    return response.data;
  }

  // Obtener estudiantes de una materia específica (para profesores)
  async getEstudiantesPorMateria(id_materia) {
    const response = await this.client.get(`/admin/materias/${id_materia}/estudiantes`, {
      params: {
        _t: Date.now() // Romper caché
      }
    });
    return response.data;
  }

  // Actualizar calificación de un estudiante en una materia
  async actualizarCalificacion(id_materia, id_estudiante, data) {
    const response = await this.client.put(`/admin/materias/${id_materia}/estudiantes/${id_estudiante}/calificacion`, data);
    return response.data;
  }
}

export default new ApiService();