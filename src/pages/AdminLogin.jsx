import { Eye, EyeOff, Shield, AlertCircle, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { useAdminLogin } from '../components/useAdminLogin';
import logo from '../assets/evento-remove.png';
import './AdminLogin.css';

export default function AdminLogin() {
  const {
    adminEmail,
    adminPassword,
    showAdminPassword,
    adminError,
    adminLoading,
    setAdminEmail,
    setAdminPassword,
    handleAdminLogin,
    toggleAdminPasswordVisibility
  } = useAdminLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAdminLogin(e);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-logo-box">
            <img src={logo} alt="Logo" />
          </div>
          
          <div className="admin-badge">
            <Shield size={24} />
            <span>Acceso Administrativo</span>
          </div>
          
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Ingresa tus credenciales de administrador para continuar</p>
        </div>

        {/* Alerta de seguridad */}
        <div className="security-notice">
          <Lock size={16} />
          <span>Esta es una zona de acceso restringido</span>
        </div>

        {/* Error */}
        {adminError && (
          <div className="error-box">
            <AlertCircle size={18} />
            <span>{adminError}</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-group">
              <i className="icon">@</i>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={adminLoading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-group">
              <i className="icon">🔒</i>
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={adminLoading}
                required
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="toggle-pass" 
                onClick={toggleAdminPasswordVisibility}
                disabled={adminLoading}
                aria-label="Mostrar contraseña"
              >
                {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-login-button" 
            disabled={adminLoading}
          >
            {adminLoading ? (
              <>
                <span className="spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                <Shield size={18} />
                Acceder al Panel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}