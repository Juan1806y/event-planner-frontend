import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api/auth';

export const useForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email.trim()) throw new Error('Por favor, ingresa tu correo electrónico');
    if (!newPassword.trim()) throw new Error('Por favor, ingresa una nueva contraseña');
    if (!confirmPassword.trim()) throw new Error('Por favor, confirma tu contraseña');
    if (newPassword !== confirmPassword) throw new Error('Las contraseñas no coinciden');
    if (newPassword.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  };

  const parseError = (response, data) => {
    if (data?.message) return data.message;
    if (data?.error) return typeof data.error === 'string' ? data.error : data.error.message;
    if (Array.isArray(data?.errors)) return data.errors.join(', ');

    if (typeof data === 'object' && data !== null) {
      const msgs = [];
      for (const value of Object.values(data)) {
        if (Array.isArray(value)) msgs.push(...value);
        if (typeof value === 'string') msgs.push(value);
        if (value?.message) msgs.push(value.message);
      }
      if (msgs.length) return msgs.join(', ');
    }

    if (response.status === 404) return 'Usuario no encontrado';
    if (response.status === 400) return 'Datos inválidos. Verifica la información ingresada';
    if (response.status >= 500) return 'Error en el servidor. Por favor, intenta más tarde';

    return 'Error al recuperar la contraseña';
  };

  const handleResetPassword = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      validateInputs();

      const payload = { correo: email.trim(), contraseña: newPassword.trim() };

      const response = await fetch(`${API_BASE_URL}/recuperar-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        if (response.status === 404) {
          throw new Error('El endpoint de recuperación no está disponible.');
        }
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(parseError(response, data));
      }

      setSuccess('Contraseña actualizada correctamente');

      setEmail('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
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
    togglePasswordVisibility: () => setShowPassword(prev => !prev),
    toggleConfirmPasswordVisibility: () => setShowConfirmPassword(prev => !prev),
    handleNavigateToLogin: () => navigate('/login')
  };
};
