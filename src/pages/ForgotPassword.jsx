import React from 'react';
import { useForgotPassword } from '../components/ForgotPassword';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import '../pages/ForgotPassword.css';
import logo from '../assets/evento-remove.png';

const ForgotPassword = () => {
  const {
    email,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    error,
    success,
    loading,
    setEmail,
    setNewPassword,
    setConfirmPassword,
    handleResetPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleNavigateToLogin
  } = useForgotPassword();

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Header */}
        <div className="forgot-password-header">
          <div className="logo-section">
            <div className="logo-icon">
              <img src={logo} alt="Logo" />
            </div>
          </div>
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu correo y nueva contraseña</p>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleResetPassword} className="forgot-password-form">
          {/* Campo de correo */}
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Campo de nueva contraseña */}
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || success}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                disabled={loading || success}
                aria-label="Mostrar/Ocultar contraseña"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Campo de confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
                disabled={loading || success}
                aria-label="Mostrar/Ocultar contraseña"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Actualizando...
              </>
            ) : success ? (
              'Contraseña Actualizada'
            ) : (
              'Actualizar Contraseña'
            )}
          </button>
        </form>

        {/* Botón para volver al login */}
        <button
          className="back-to-login"
          onClick={handleNavigateToLogin}
          disabled={loading}
        >
          <ArrowLeft size={18} />
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;