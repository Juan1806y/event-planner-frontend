// components/OrganizerComponents.jsx
import React from 'react';
import { Lock, X, Eye, EyeOff, Menu, LogOut } from 'lucide-react';
import EventosPage from './EventosPage'; // Ajusta la ruta según tu estructura
import './OrganizerDashboard.css';
import ActividadesPage from './ActividadesPage';

// Modal de Contraseña
export const PasswordModal = ({
    isOpen,
    onClose,
    passwordData,
    showPasswords,
    passwordError,
    passwordSuccess,
    isLoading,
    onPasswordChange,
    onToggleVisibility,
    onSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">
                        <Lock size={24} className="title-icon" />
                        Cambiar Contraseña
                    </h3>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Campo de Correo */}
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            value={passwordData.correo}
                            onChange={(e) => onPasswordChange('correo', e.target.value)}
                            className="form-input"
                            placeholder="Ej: usuario@ejemplo.com"
                        />
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="form-group">
                        <label className="form-label">Nueva Contraseña</label>
                        <div className="input-wrapper">
                            <input
                                type={showPasswords.nueva ? 'text' : 'password'}
                                value={passwordData.contraseñaNueva}
                                onChange={(e) => onPasswordChange('contraseñaNueva', e.target.value)}
                                className="form-input"
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => onToggleVisibility('nueva')}
                                className="toggle-password"
                            >
                                {showPasswords.nueva ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="form-group">
                        <label className="form-label">Confirmar Nueva Contraseña</label>
                        <div className="input-wrapper">
                            <input
                                type={showPasswords.confirmar ? 'text' : 'password'}
                                value={passwordData.confirmarContraseña}
                                onChange={(e) => onPasswordChange('confirmarContraseña', e.target.value)}
                                className="form-input"
                                placeholder="Repite la nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => onToggleVisibility('confirmar')}
                                className="toggle-password"
                            >
                                {showPasswords.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Requisitos */}
                    <div className="requirements-box">
                        <p className="requirements-title">Requisitos de la contraseña:</p>
                        <ul className="requirements-list">
                            <li>• Mínimo 8 caracteres</li>
                            <li>• Al menos una letra mayúscula</li>
                            <li>• Al menos un número</li>
                        </ul>
                    </div>

                    {/* Mensajes */}
                    {passwordError && (
                        <div className="alert alert-error">
                            <p>{passwordError}</p>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="alert alert-success">
                            <p>{passwordSuccess}</p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="modal-actions">
                        <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
                            Cancelar
                        </button>
                        <button onClick={onSubmit} disabled={isLoading} className="btn btn-primary">
                            {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tarjeta estadística
export const StatCard = ({ label, value, color }) => (
    <div className="stat-card">
        <div className="stat-content">
            <div>
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
            </div>
            <div className={`stat-icon ${color}`}></div>
        </div>
    </div>
);

// Fila de evento
export const EventRow = ({ event }) => (
    <div className="event-row">
        <div>
            <p className="event-name">{event.name}</p>
            <p className="event-date">{event.date}</p>
        </div>
        <span className={`event-status status-${event.status.toLowerCase()}`}>
            {event.status}
        </span>
    </div>
);

// Contenido principal
export const MainContent = ({ activeSection, stats, recentEvents }) => (
    <div className="main-content">

        {activeSection === 'inicio' && (
            <div>
                {/* Estadísticas */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Eventos recientes */}
                <div className="events-container">
                    <h2 className="events-title">Eventos Recientes</h2>
                    <div>
                        {recentEvents.map((event, index) => (
                            <EventRow key={index} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeSection === 'eventos' && <EventosPage />}
        {activeSection === 'actividades' && <ActividadesPage />}

        {activeSection !== 'inicio' && activeSection !== 'eventos' && (
            <div className="placeholder-content">
                <p>Contenido de {activeSection} - En desarrollo</p>
            </div>
        )}
    </div>
);

// Encabezado
export const Header = ({ isSidebarOpen, onToggleSidebar }) => (
    <header className="header">
        <button onClick={onToggleSidebar} className="toggle-sidebar-btn">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
    </header>
);