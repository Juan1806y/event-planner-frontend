import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export const useAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setAdminError('');
    setAdminLoading(true);

    try {
      // Validación básica
      if (!adminEmail.trim() || !adminPassword) {
        throw new Error('Por favor completa todos los campos');
      }

      // Delegar al AuthContext para actualizar el estado global
      const result = await login(adminEmail, adminPassword, 'admin');
      console.log('Respuesta del AuthContext login (admin):', result);

      if (!result.success) {
        throw new Error(result.error || 'Error durante el inicio de sesión de administrador');
      }

      const redirectPath = result.redirectPath || '/admin';
      console.log('Login de administrador exitoso! Redirigiendo a:', redirectPath);
      navigate(redirectPath);
      
    } catch (err) {
      console.error('Error durante el inicio de sesión de admin:', err);
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const toggleAdminPasswordVisibility = () => {
    setShowAdminPassword(!showAdminPassword);
  };

  const resetAdminForm = () => {
    setAdminEmail('');
    setAdminPassword('');
    setShowAdminPassword(false);
    setAdminError('');
  };

  return {
    // Estados
    adminEmail,
    adminPassword,
    showAdminPassword,
    adminError,
    adminLoading,
    
    // Funciones para actualizar estados
    setAdminEmail,
    setAdminPassword,
    
    // Funciones de acción
    handleAdminLogin,
    toggleAdminPasswordVisibility,
    resetAdminForm
  };
};