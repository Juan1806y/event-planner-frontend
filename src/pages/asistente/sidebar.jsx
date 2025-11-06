import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './sidebar.module.css';

import hamburgerIcon from '../../assets/hamburgerIcon.png';
import eventosIcon from '../../assets/security.png';
import agendaIcon from '../../assets/person.png';
import encuestaIcon from '../../assets/settings.png';
import logoIcon from '../../assets/evento-remove.png';

const Sidebar = ({ onToggle, onSectionChange, activeSection }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMenu = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleMenuClick = (menuId) => {
    if (onSectionChange) {
      onSectionChange(menuId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (id) => {
    return activeSection === id;
  };

  const renderIcon = (icon) => {
    return (
      <img 
        className={styles.menuIcon} 
        src={icon} 
        alt="menu icon"
        onError={(e) => {
          console.error('Error cargando icono:', icon);
          e.target.style.display = 'none';
        }}
      />
    );
  };

  return (
    <div className={`${styles.rectangleParent} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.groupChild} />
      <button 
        className={styles.hamburgerIcon} 
        onClick={toggleMenu} 
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
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
      <div className={styles.logoSection}>
        {!isCollapsed ? (
          <div className={styles.panelDeAdministracin}>Panel de Asistente</div>
        ) : (
          <img 
            src={logoIcon} 
            alt="Event Planner" 
            className={styles.logoCollapsed}
          />
        )}
      </div>
      <div className={styles.menuContainer}>

        <div className={styles.menuItem}>
          <div 
            className={`${styles.menuItemContent} ${
              isActive('eventos') ? styles.activeMenuItem : ''
            }`}
            onClick={() => handleMenuClick('eventos')}
            title={isCollapsed ? 'Eventos' : ''}
          >
            {renderIcon(eventosIcon)}
            {!isCollapsed && (
              <span className={styles.menuLabel}>Eventos</span>
            )}
          </div>
        </div>

        <div className={styles.menuItem}>
          <div 
            className={`${styles.menuItemContent} ${
              isActive('agenda') ? styles.activeMenuItem : ''
            }`}
            onClick={() => handleMenuClick('agenda')}
            title={isCollapsed ? 'Agenda' : ''}
          >
            {renderIcon(agendaIcon)}
            {!isCollapsed && (
              <span className={styles.menuLabel}>Agenda</span>
            )}
          </div>
        </div>

        <div className={styles.menuItem}>
          <div 
            className={`${styles.menuItemContent} ${
              isActive('encuesta') ? styles.activeMenuItem : ''
            }`}
            onClick={() => handleMenuClick('encuesta')}
            title={isCollapsed ? 'Encuesta' : ''}
          >
            {renderIcon(encuestaIcon)}
            {!isCollapsed && (
              <span className={styles.menuLabel}>Encuesta</span>
            )}
          </div>
        </div>

      </div>

      <button 
        className={styles.logoutButton}
        onClick={handleLogout}
        title="Cerrar Sesión"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.logoutIcon}>
          <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M8 16l-5-5 5-5M3 11h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {!isCollapsed && <span>Cerrar Sesión</span>}
      </button>
    </div>
  );
};

export default Sidebar;