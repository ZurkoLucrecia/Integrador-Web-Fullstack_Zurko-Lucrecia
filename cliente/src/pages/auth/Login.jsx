import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthUtils from '../../utils/auth';
import api from '../../services/api';
import '../../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Llamar al método de inicio de sesión del servicio API
      const data = await api.login({ email, password });
      
      // Guardar token en localStorage
      AuthUtils.setToken(data.token);
      
      // Redirigir al panel de control
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" opacity="0.3"/>
              <path d="M12 14l9-5v7.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5V9l9 5z" fill="currentColor"/>
            </svg>
          </div>
          <h1>Campus Virtual</h1>
          <p>Accede a tu espacio educativo</p>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                </svg>
                Ingresando...
              </>
            ) : (
              <>
                Iniciar Sesión
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Problemas para ingresar? Contacta al administrador</p>
        </div>
      </div>
    </div>
  );
};

export default Login;