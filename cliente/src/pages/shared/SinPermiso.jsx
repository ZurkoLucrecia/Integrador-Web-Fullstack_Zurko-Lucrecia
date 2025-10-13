import React from 'react';
import { Link } from 'react-router-dom';

const SinPermiso = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#dc3545' }}>403</h1>
      <h2>Acceso Denegado</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        No tienes permisos para acceder a esta página.
      </p>
      <Link 
        to="/dashboard" 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px'
        }}
      >
        Volver al Panel de Control
      </Link>
    </div>
  );
};

export default SinPermiso;