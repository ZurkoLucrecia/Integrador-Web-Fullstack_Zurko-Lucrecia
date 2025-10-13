import { jwtDecode } from 'jwt-decode';

class AuthUtils {
  // Almacenar token en localStorage
  static setToken(token) {
    try {
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error almacenando token:', error);
      throw new Error('No se pudo almacenar la información de autenticación');
    }
  }

  // Obtener token de localStorage
  static getToken() {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  // Eliminar token de localStorage
  static removeToken() {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error eliminando token:', error);
      throw new Error('No se pudo cerrar la sesión correctamente');
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated() {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      // Verificar si el token ha expirado usando jwt-decode
      const payload = jwtDecode(token);
      if (!payload) return false;
      
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // Obtener datos del usuario del token
  static getUser() {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Obtener rol del usuario del token
  static getUserRole() {
    try {
      const user = this.getUser();
      return user ? user.rol : null;
    } catch (error) {
      console.error('Error obteniendo rol de usuario:', error);
      return null;
    }
  }

  // Obtener ID del usuario del token
  static getUserId() {
    try {
      const user = this.getUser();
      return user ? user.id : null;
    } catch (error) {
      console.error('Error obteniendo ID de usuario:', error);
      return null;
    }
  }

  // Verificar si el usuario tiene el rol requerido
  static hasRole(requiredRole) {
    try {
      const userRole = this.getUserRole();
      return userRole === requiredRole;
    } catch (error) {
      console.error('Error verificando rol de usuario:', error);
      return false;
    }
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  static hasAnyRole(requiredRoles) {
    try {
      const userRole = this.getUserRole();
      return requiredRoles.includes(userRole);
    } catch (error) {
      console.error('Error verificando roles de usuario:', error);
      return false;
    }
  }
}

export default AuthUtils;