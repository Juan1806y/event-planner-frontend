import { React } from 'react';
import { Lock, LogOut, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useSidebar } from '../../components/SideBarOrganizador';
import './Sidebar.css';
import { Navigate, useNavigate } from 'react-router-dom';

const Sidebar = ({ onSectionChange }) => {
    const {
        isOpen,
        user,
        activeSection,
        menuItems,
        showPasswordModal,
        passwordData,
        showPasswords,
        passwordError,
        passwordSuccess,
        isLoading,
        handleMenuClick,
        toggleSidebar,
        openPasswordModal,
        closePasswordModal,
        handlePasswordChange,
        togglePasswordVisibility,
        handleSubmitPassword,
        handleLogout
    } = useSidebar();

    const navigate = useNavigate();

    const onMenuClickHandler = (sectionId) => {
        handleMenuClick(sectionId);
        if (onSectionChange) onSectionChange(sectionId);
    };

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="sidebar-toggle-btn"
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-header">
                    <div
                        className="user-info"
                        onClick={() => {
                            handleMenuClick('inicio');
                            navigate('/organizador');
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="user-avatar">
                            {user?.nombre?.[0]?.toUpperCase() || 'O'}
                        </div>
                        <div className="user-details">
                            <h3 className="user-name">{user?.nombre || 'Organizador'}</h3>
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
                                onClick={() => onMenuClickHandler(item.id)}
                                className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={openPasswordModal} className="nav-item">
                        <Lock size={20} />
                        <span>Cambiar Contraseña</span>
                    </button>

                    <button onClick={handleLogout} className="nav-item nav-item-logout">
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div >

            {showPasswordModal && (
                <div className="modal-overlay" onClick={closePasswordModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Cambiar Contraseña</h2>

                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                value={passwordData.correo}
                                disabled
                                className="form-input form-input-disabled"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nueva contraseña</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.nueva ? 'text' : 'password'}
                                    value={passwordData.contraseñaNueva}
                                    onChange={(e) =>
                                        handlePasswordChange('contraseñaNueva', e.target.value)
                                    }
                                    className="form-input"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('nueva')}
                                    className="password-toggle-btn"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPasswords.nueva ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirmar contraseña</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.confirmar ? 'text' : 'password'}
                                    value={passwordData.confirmarContraseña}
                                    onChange={(e) =>
                                        handlePasswordChange('confirmarContraseña', e.target.value)
                                    }
                                    className="form-input"
                                    placeholder="Repite la contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirmar')}
                                    className="password-toggle-btn"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPasswords.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <div className="alert alert-error">{passwordError}</div>
                        )}

                        {passwordSuccess && (
                            <div className="alert alert-success">{passwordSuccess}</div>
                        )}

                        <div className="modal-actions">
                            <button
                                onClick={closePasswordModal}
                                disabled={isLoading}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSubmitPassword}
                                disabled={isLoading}
                                className="btn btn-primary"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default Sidebar;