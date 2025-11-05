// src/pages/GerenteDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GerenteSidebar from '../gerente/GerenteSidebar';
import './GerenteDashboard.css';
import Header from '../../layouts/Header/header';

const GerenteDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmpleados: 24,
    proyectosActivos: 8,
    tareasPendientes: 15,
    rendimiento: 87
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token'); // CAMBIO AQUÍ
    
    console.log('User Data:', userData);
    
    if (!userData || !token) {
      console.log('No hay token o usuario, redirigiendo al login');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [navigate]);

  // Fetch del equipo
  useEffect(() => {
    const fetchEquipo = async () => {
      if (!user?.rolData?.id_empresa) {
        console.log('No hay id_empresa disponible');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('access_token'); // CAMBIO AQUÍ
        
        console.log('Fetching equipo con token:', token);
        console.log('ID Empresa:', user.rolData.id_empresa);
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const API_URL = 'http://localhost:3000';
        
        const response = await fetch(
          `${API_URL}/api/empresas/${user.rolData.id_empresa}/equipo`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Response status:', response.status);

        if (response.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar el equipo');
        }

        const data = await response.json();
        console.log('Datos del equipo:', data);
        setEquipo(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar equipo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipo();
  }, [user, navigate]);

  return (
    <div className="gerente-layout">
      <GerenteSidebar />
      
      <div className="gerente-content">
        <Header />

        <main className="gerente-main">
          <div className="welcome-card">
            <h2>Bienvenido, {user?.nombre || user?.name || 'Gerente'}</h2>
            <p>Panel de control y gestión empresarial</p>
          </div>

          <div className="info-section">
            {/* Card de Equipo */}
            <div className="info-card">
              <h3>👥 Equipo de Trabajo</h3>
              {loading ? (
                <div className="loading-state">
                  <p>Cargando equipo...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>Error: {error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="retry-button"
                  >
                    Reintentar
                  </button>
                </div>
              ) : equipo.length === 0 ? (
                <div className="empty-state">
                  <p>No hay miembros en el equipo</p>
                </div>
              ) : (
                <div className="team-list">
                  {equipo.map((miembro) => (
                    <div key={miembro.id} className="team-member">
                      <div className="member-avatar">
                        {miembro.usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <p className="member-name">{miembro.usuario.nombre}</p>
                        <span className="member-role">
                          {miembro.rol === 'gerente' ? '🔑 Gerente' : '📋 Organizador'}
                        </span>
                      </div>
                      <div className="member-contact">
                        <span className="member-email">{miembro.usuario.correo}</span>
                        {miembro.usuario.telefono && (
                          <span className="member-phone">📞 {miembro.usuario.telefono}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card de Actividades */}
            <div className="info-card">
              <h3>📌 Actividades Recientes</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div className="activity-info">
                    <p className="activity-text">Actualización de información empresarial</p>
                    <span className="activity-time">Hace 2 horas</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div className="activity-info">
                    <p className="activity-text">Nuevo proyecto asignado al equipo</p>
                    <span className="activity-time">Hace 5 horas</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div className="activity-info">
                    <p className="activity-text">Revisión de solicitudes pendientes</p>
                    <span className="activity-time">Ayer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GerenteDashboard;