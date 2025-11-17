// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, getRoleName } from '../utils/roleUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>
          Dashboard
        </h1>
        
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Bienvenido:</strong> {user?.nombre || 'Usuario'}
          </p>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            <strong>Correo:</strong> {user?.correo || 'No disponible'}
          </p>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            <strong>Rol:</strong> {getRoleName(user)}
          </p>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            <strong>Teléfono:</strong> {user?.telefono || 'No disponible'}
          </p>
          
          {/* Botón para acceder al panel de administración - solo visible para admins */}
          {isAdmin(user) && (
            <button 
              onClick={() => navigate('/admin')}
              style={{
                background: '#67a6f9',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginRight: '15px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a95e8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#67a6f9'}
            >
              🛡️ Panel de Administración
            </button>
          )}
        </div>

        <button 
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;