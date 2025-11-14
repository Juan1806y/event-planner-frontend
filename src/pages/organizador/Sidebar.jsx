// src/components/organizer/Sidebar.jsx
import React from 'react';
import { Lock, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, user, menuItems, activeSection, onMenuClick, onOpenPasswordModal, onLogout }) => (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
            <div className="user-info">
                <div className="user-avatar">O</div>
                <div className="user-details">
                    <h3 className="user-name">Organizador</h3>
                    <p className="user-role">{user?.correo}</p>
                </div>
            </div>
        </div>

        <nav className="sidebar-nav">
            {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onMenuClick(item.id)}
                        className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>

        <div className="sidebar-footer">
            <button onClick={onOpenPasswordModal} className="nav-item">
                <Lock size={20} />
                <span>Cambiar Contraseña</span>
            </button>

            <button onClick={onLogout} className="nav-item text-red-500 hover:text-red-600">
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </div>
);

export default Sidebar;
