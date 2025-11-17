import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000';

export const useAdminLogin = () => {
  const navigate = useNavigate();
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

      // Enviar con los nombres de campos que espera el backend
      const payload = { correo: adminEmail, contraseña: adminPassword };
      console.log('Enviando login de admin al backend:', payload);
      
      // Usar el mismo endpoint de login normal
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Respuesta del backend (admin):', data);

      if (!response.ok) {
        // Manejo de errores
        let errorMessages = [];
        if (typeof data === 'object') {
          for (const messages of Object.values(data)) {
            if (Array.isArray(messages)) {
              errorMessages = errorMessages.concat(messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          }
        } else if (typeof data === 'string') {
          errorMessages.push(data);
        }
        const errorMessage = errorMessages.join(', ') || 'Error durante el inicio de sesión de administrador';
        throw new Error(errorMessage);
      }

      // Los tokens están en data.data según la respuesta del backend
      const token = data.data?.accessToken;
      const refreshToken = data.data?.refreshToken;
      const usuario = data.data?.usuario;

      if (token) {
        // Verificar que el usuario sea administrador
        if (usuario?.rol !== 'admin' && usuario?.rol !== 'administrador') {
          throw new Error('Acceso denegado: No tienes permisos de administrador');
        }

        localStorage.setItem('access_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        // Guardar información del usuario admin
        if (usuario) {
          localStorage.setItem('user', JSON.stringify(usuario));
        }
        // Marcar explícitamente como admin
        localStorage.setItem('selected_role', 'admin');
        
        console.log('Login de administrador exitoso!');
        
        // Redirigir al panel de administrador
        navigate('/admin');
      } else {
        throw new Error('No se recibió el token de acceso');
      }
      
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