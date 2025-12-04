import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedirectPath } from '../utils/roleUtils';
import { useAuth } from '../contexts/AuthContext';

// Configuración de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Mapeo de roles de la UI a roles del backend
const ROLE_MAPPING = {
  'asistente': ['asistente'],
  'gerente': ['gerente'],
  'ponente': ['ponente'],
  'organizador': ['organizador']
};

export const useLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setLoading(true);

    try {
      // Usar el método de login del AuthContext para actualizar el estado global
      const selectedRole = localStorage.getItem('selected_role');
      console.log('Rol seleccionado en UI:', selectedRole);

      const result = await login(email, password, selectedRole);

      if (!result.success) {
        throw new Error(result.error || 'Error durante el inicio de sesión');
      }

      // result.redirectPath puede venir del AuthProvider
      const redirectPath = result.redirectPath || getRedirectPath(localStorage.getItem('selected_role'));
      console.log('Login exitoso!');
      console.log('Redirigiendo a:', redirectPath);
      navigate(redirectPath);

    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);

      // Manejo de errores de red
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timeout')) {
        setError('El servidor no responde. Por favor, intenta más tarde.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNavigateToForgotPassword = () => {
    navigate('/forgotpassword');
  };

  const handleNavigateToRegister = () => {
    window.location.href = '/register';
  };

  return {
    // Estados
    email,
    password,
    showPassword,
    error,
    loading,

    // Funciones para actualizar estados
    setEmail,
    setPassword,

    // Funciones de acción
    handleLogin,
    togglePasswordVisibility,
    handleNavigateToForgotPassword,
    handleNavigateToRegister
  };
};