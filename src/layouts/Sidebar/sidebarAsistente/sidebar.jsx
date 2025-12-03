import React, { useState } from 'react';
import styles from './sidebar.module.css';
import campana from '../../../assets/calendar.png';
import hamburgerIcon from '../../../assets/hamburgerIcon.png';
import logoIcon from '../../../assets/evento-remove.png';
import calendarEvento from '../../../assets/calendarEvento.png'

const Sidebar = ({ onToggle, onNavigate, currentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (view) => currentView === view;

  return (
    <aside className={`${styles.rectangleParent} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.groupChild} />

      <button
        className={styles.hamburgerIcon}
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
            className={`${styles.menuItemContent} ${isActive('dashboard') ? styles.activeMenuItem : ''
              }`}
            onClick={() => onNavigate('dashboard')}
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.menuIcon}>
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {!isCollapsed && <span className={styles.menuLabel}>Dashboard</span>}
          </div>
        </div>

        <div className={styles.menuItem}>
          <div
            className={`${styles.menuItemContent} ${isActive('eventos') ? styles.activeMenuItem : ''
              }`}
            onClick={() => onNavigate('eventos')}
            title={isCollapsed ? 'Eventos' : ''}
          >
            <img src={calendarEvento} alt="Evento Icon" className={styles.menuIcon} />
            {!isCollapsed && <span className={styles.menuLabel}>Eventos</span>}
          </div>
        </div>

        <div className={styles.menuItem}>
          <div
            className={`${styles.menuItemContent} ${isActive('agenda') ? styles.activeMenuItem : ''
              }`}
            onClick={() => onNavigate('agenda')}
            title={isCollapsed ? 'Agenda' : ''}
          >
            <img src={campana} alt="Agenda Icon" className={styles.menuIcon} />
            {!isCollapsed && <span className={styles.menuLabel}>Agenda</span>}
          </div>
        </div>

        <div className={styles.menuItem}>
          <div
            className={`${styles.menuItemContent} ${isActive('encuestas') ? styles.activeMenuItem : ''}`}
            onClick={() => onNavigate('encuestas')}
            title={isCollapsed ? 'Encuestas' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
              <rect x="5" y="4" width="14" height="16" rx="1"
                stroke="white" strokeWidth="2" />

              <line x1="8" y1="8" x2="16" y2="8"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="12" x2="16" y2="12"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="16" x2="12" y2="16"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {!isCollapsed && <span className={styles.menuLabel}>Encuestas</span>}
          </div>
        </div>
      </div>

      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        title="Cerrar Sesión"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.logoutIcon}>
          <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M8 16l-5-5 5-5M3 11h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!isCollapsed && <span>Cerrar Sesión</span>}
      </button>
    </aside>
  );
};

export default Sidebar;