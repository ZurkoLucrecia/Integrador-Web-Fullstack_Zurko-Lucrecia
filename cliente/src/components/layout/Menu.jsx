import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthUtils from '../../utils/auth';

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status and user role
    const authStatus = AuthUtils.isAuthenticated();
    const role = AuthUtils.getUserRole();
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
  }, [location]); // Re-run when location changes

  const handleLogout = () => {
    try {
      AuthUtils.removeToken();
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Only show menu if user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav style={{ 
      backgroundColor: '#2563eb',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div>
          <Link to="/dashboard" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            Campus Virtual
          </Link>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem'
        }}>
          <button 
            onClick={handleLogout}
            style={{ 
              backgroundColor: '#ef4444',
              color: 'white', 
              border: 'none', 
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Menu;