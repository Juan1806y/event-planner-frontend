import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Briefcase } from 'lucide-react';
import '../pages/register.css';
import logo from '../assets/evento-remove.png';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState('asistente');
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    especialidad: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.cedula.trim()) {
      setError('La cédula es obligatoria');
      return false;
    }
    if (!formData.correo.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      setError('El correo electrónico no es válido');
      return false;
    }
    if (!formData.contraseña) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (selectedRole === 'ponente' && !formData.especialidad.trim()) {
      setError('La especialidad es obligatoria para ponentes');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono || null,
        correo: formData.correo,
        contraseña: formData.contraseña,
        rol: selectedRole
      };

      if (selectedRole === 'ponente') {
        payload.especialidad = formData.especialidad;
      }

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error durante el registro');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      console.error('Error durante el registro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="success-title">¡Registro Exitoso!</h2>
          <p className="success-message">Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <div className="role-selection">
          <p className="role-selection-title">Selecciona tu tipo de cuenta</p>
          <div className="register-role-grid">
            <button
              type="button"
              onClick={() => handleRoleSelect('asistente')}
              className={`role-button ${selectedRole === 'asistente' ? 'active' : ''}`}
            >
              <div className="role-icon">
                <User />
              </div>
              <h3 className="role-name">Asistente</h3>
              <p className="role-description">Participante</p>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('ponente')}
              className={`role-button ${selectedRole === 'ponente' ? 'active' : ''}`}
            >
              <div className="role-icon">
                <Briefcase />
              </div>
              <h3 className="role-name">Ponente</h3>
              <p className="role-description">Expositor</p>
            </button>
          </div>
        </div>

        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cédula</label>
            <div className="input-wrapper">
              <CreditCard className="input-icon" />
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Teléfono <span className="optional">(opcional)</span>
            </label>
            <div className="input-wrapper">
              <Phone className="input-icon" />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {selectedRole === 'ponente' && (
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" />
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Marketing Digital, Tecnología, etc."
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmarContraseña"
                value={formData.confirmarContraseña}
                onChange={handleInputChange}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </div>

        <div className="footer-text">
          <p>
            ¿Ya tienes cuenta?{' '}
            <a href="/login">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}