// src/components/GerenteSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GerenteSidebar.css';
import dashboardIcon from '../../../assets/dashboardIcon.png';
import empresa from '../../../assets/person.png';
import triangulo from '../../../assets/expand-arrow.png';
import campana from '../../../assets/notifications.png';
import settings from '../../../assets/settings.png';
import hamburgerIcon from '../../../assets/hamburgerIcon.png';
import logoIcon from '../../../assets/evento-remove.png';
import calendarEvento from '../../../assets/calendarEvento.png'

const GerenteSidebar = ({onToggle}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaOpen, setEmpresaOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if(onToggle){
      onToggle(newCollapsedState);
    }
    
    if (newCollapsedState) {
      setEmpresaOpen(false);
    }
  };

  const handleEmpresaClick = () => {
    if (!isCollapsed) {
      setEmpresaOpen(!empresaOpen);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`gerente-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <img
            src={hamburgerIcon}
            alt="menu toggle"
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (!parent.querySelector('.fallbackHamburger')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallbackHamburger';
                fallback.innerHTML = `
                  <div style="width: 20px; height: 2px; background: white; margin: 4px 0;"></div>
                  <div style="width: 20px; height: 2px; background: white; margin: 4px 0;"></div>
                  <div style="width: 20px; height: 2px; background: white; margin: 4px 0;"></div>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
        </button>
        <div className="logo-section">
          {!isCollapsed ? (
            <div className="panel-title">Panel de Gerente </div>
          ) : (
            <img
              src={logoIcon}
              alt="Event Planner"
              className="logo-collapsed"
            />
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${isActive('/gerente') ? 'active' : ''}`}
          onClick={() => navigate('/gerente')}
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <img src={dashboardIcon} alt="Dashboard Icon" />
          {!isCollapsed && <span className="nav-text">Dashboard</span>}
        </button>

        <div className="nav-group">
          <button
            className={`nav-item ${empresaOpen ? 'open' : ''}`}
            onClick={handleEmpresaClick}
            title={isCollapsed ? 'Empresa' : ''}
          >
            <img src={empresa} alt="Empresa Icon" />
            {!isCollapsed && (
              <>
                <span className="nav-text">Empresa</span>
                <img
                  src={triangulo}
                  alt="Triangulo Icon"
                  className={`expand-icon ${empresaOpen ? 'expanded' : ''}`}
                />
              </>
            )}
          </button>

          {empresaOpen && !isCollapsed && (
            <div className="subnav">
              <button
                className={`subnav-item ${isActive('/gerente/actualizar-empresa') ? 'active' : ''}`}
                onClick={() => navigate('/gerente/actualizar-empresa')}
              >
                Actualizar Información
              </button>

              <button
                className={`subnav-item ${isActive('/gerente/ubicaciones') ? 'active' : ''}`}
                onClick={() => navigate('/gerente/ubicaciones')}
              >
                Ubicaciones
              </button>

              <button
                className={`subnav-item ${isActive('/gerente/lugares') ? 'active' : ''}`}
                onClick={() => navigate('/gerente/lugares')}
              >
                Lugares
              </button>

              <button
                className={`subnav-item ${isActive('/gerente/crear-organizador') ? 'active' : ''}`}
                onClick={() => navigate('/gerente/crear-organizador')}
              >
                Crear Organizador
              </button>
            </div>
          )}
        </div>

        <button
          className={`nav-item ${isActive('/gerente/eventos') ? 'active' : ''}`}
          onClick={() => navigate('/gerente/eventos')}
          title={isCollapsed ? 'Eventos' : ''}
        >
          <img src={calendarEvento} alt="Evento Icon" />
          {!isCollapsed && <span className="nav-text">Eventos</span>}
        </button>

        <button
          className={`nav-item ${isActive('/gerente/solicitudes') ? 'active' : ''}`}
          onClick={() => navigate('/gerente/solicitudes')}
          title={isCollapsed ? 'Mis solicitudes' : ''}
        >
          <img src={campana} alt="Solicitudes Icon" />
          {!isCollapsed && <span className="nav-text">Mis solicitudes</span>}
        </button>

        <button
          className={`nav-item ${isActive('/gerente/configuracion') ? 'active' : ''}`}
          onClick={() => navigate('/gerente/configuracion')}
          title={isCollapsed ? 'Configuración' : ''}
        >
          <img src={settings} alt="Configuración Icon" />
          {!isCollapsed && <span className="nav-text">Configuración</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Cerrar Sesión"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="logout-icon">
            <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M8 16l-5-5 5-5M3 11h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default GerenteSidebar;