import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './menu.module.css';

import securityIcon from '../../../assets/security.png';
import settingsIcon from '../../../assets/settings.png';
import personIcon from '../../../assets/person.png';
import hamburgerIcon from '../../../assets/hamburgerIcon.png';
import expandIcon from '../../../assets/expand-arrow.png';
import dashboardIcon from '../../../assets/dashboardIcon.png';
import logoIcon from '../../../assets/evento-remove.png';

const Menu = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({
        seguridad: false,
        afiliaciones: false
    });

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: dashboardIcon,
            hasSubmenu: false,
            path: '/admin/dashboard'
        },
        {
            id: 'seguridad',
            label: 'Seguridad',
            icon: securityIcon,
            hasSubmenu: true,
            submenu: [
                { id: 'roles', label: 'Roles', path: '/admin/roles' },
                { id: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' }
            ]
        },
        {
            id: 'afiliaciones',
            label: 'Afiliaciones',
            icon: personIcon,
            hasSubmenu: true,
            submenu: [
                { id: 'afiliaciones-pendientes', label: 'Afiliaciones Pendientes', path: '/admin/afiliaciones-pendientes' },
                { id: 'afiliaciones-aprobadas', label: 'Afiliaciones Aprobadas', path: '/admin/afiliaciones-aprobadas' },
                { id: 'afiliaciones-rechazadas', label: 'Afiliaciones Rechazadas', path: '/admin/afiliaciones-rechazadas' }
            ]
        },
    ];

    const getActiveSection = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
        if (path.includes('/admin/roles')) return 'roles';
        if (path.includes('/admin/usuarios')) return 'usuarios';
        if (path.includes('/admin/afiliaciones-pendientes')) return 'afiliaciones-pendientes';
        if (path.includes('/admin/afiliaciones-aprobadas')) return 'afiliaciones-aprobadas';
        if (path.includes('/admin/afiliaciones-rechazadas')) return 'afiliaciones-rechazadas';
        return 'dashboard';
    };

    const activeSection = getActiveSection();

    useEffect(() => {
        menuItems.forEach(item => {
            if (item.hasSubmenu && item.submenu) {
                const hasActiveSubmenu = item.submenu.some(sub => sub.id === activeSection);
                if (hasActiveSubmenu) {
                    setExpandedMenus(prev => ({
                        ...prev,
                        [item.id]: true
                    }));
                }
            }
        });
    }, [activeSection, location]);

    const toggleMenu = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    const toggleSubmenu = (menuId) => {
        if (!isCollapsed) {
            setExpandedMenus(prev => ({
                ...prev,
                [menuId]: !prev[menuId]
            }));
        }
    };

    const handleMenuClick = (item) => {
        if (item.hasSubmenu && !isCollapsed) {
            toggleSubmenu(item.id);
        } else if (!item.hasSubmenu && item.path) {
            navigate(item.path);
        }
    };

    const handleSubmenuClick = (submenuItem) => {
        if (submenuItem.path) {
            navigate(submenuItem.path);
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

    const isParentMenuActive = (item) => {
        if (item.hasSubmenu) {
            return false;
        }
        return activeSection === item.id;
    };

    const shouldShowAsActive = (item) => {
        return isParentMenuActive(item);
    };

    const isSubmenuActive = (submenuItems) => {
        return submenuItems?.some(item => activeSection === item.id);
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
                    <div className={styles.panelDeAdministracin}>Panel de Administración</div>
                ) : (
                    <img
                        src={logoIcon}
                        alt="Event Planner"
                        className={styles.logoCollapsed}
                    />
                )}
            </div>
            <div className={styles.menuContainer}>
                {menuItems.map((item) => (
                    <div key={item.id} className={styles.menuItem}>
                        <div
                            className={`${styles.menuItemContent} ${shouldShowAsActive(item) ? styles.activeMenuItem : ''
                                } ${item.id === 'dashboard' ? styles.dashboardItem : ''}`}
                            onClick={() => handleMenuClick(item)}
                            title={isCollapsed ? item.label : ''}
                        >
                            {renderIcon(item.icon)}
                            {!isCollapsed && (
                                <>
                                    <span className={styles.menuLabel}>{item.label}</span>
                                    {item.hasSubmenu && (
                                        <div className={`${styles.expandIcon} ${expandedMenus[item.id] ? styles.expanded : ''}`}>
                                            <img
                                                src={expandIcon}
                                                alt="expand"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.textContent = '▼';
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {item.hasSubmenu && expandedMenus[item.id] && !isCollapsed && (
                            <div className={styles.submenu}>
                                {item.submenu.map((subItem) => (
                                    <div
                                        key={subItem.id}
                                        className={`${styles.submenuItem} ${isActive(subItem.id) ? styles.activeSubmenuItem : ''}`}
                                        onClick={() => handleSubmenuClick(subItem)}
                                    >
                                        {subItem.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
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
        </div>
    );
};

export default Menu;