import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedirectPath } from '../utils/roleUtils';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000';

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

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setLoading(true);

    try {
      // Obtener el rol seleccionado en la UI
      const selectedRole = localStorage.getItem('selected_role');
      console.log('Rol seleccionado en UI:', selectedRole);

      // Enviar con los nombres de campos que espera el backend
      const payload = { correo: email, contraseña: password };
      console.log('Enviando al backend:', payload);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Intentar parsear la respuesta JSON
      let data;
      try {
        data = await response.json();
        console.log('Respuesta del backend:', data);
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        // Manejo mejorado de errores
        let errorMessage = 'Error durante el inicio de sesión';

        // Caso 1: Mensaje directo en data.message
        if (data.message) {
          errorMessage = data.message;
        }
        // Caso 2: Mensaje en data.error
        else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || errorMessage;
        }
        // Caso 3: Array de errores en data.errors
        else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
        // Caso 4: Objeto con mensajes de validación
        else if (typeof data === 'object' && data !== null) {
          const errorMessages = [];

          // Buscar mensajes en el objeto
          Object.entries(data).forEach(([key, value]) => {
            // Saltar propiedades que no son errores
            if (key === 'data' || key === 'status' || key === 'statusCode') {
              return;
            }

            if (Array.isArray(value)) {
              errorMessages.push(...value);
            } else if (typeof value === 'string') {
              errorMessages.push(value);
            } else if (typeof value === 'object' && value.message) {
              errorMessages.push(value.message);
            }
          });

          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        }

        // Mensajes específicos para códigos de estado comunes
        if (response.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos';
        } else if (response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (response.status === 403) {
          errorMessage = 'Acceso denegado';
        } else if (response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor, intenta más tarde';
        }

        throw new Error(errorMessage);
      }

      // Los tokens están en data.data según la respuesta del backend
      const token = data.data?.accessToken;
      const refreshToken = data.data?.refreshToken;
      const usuario = data.data?.usuario;

      if (token) {
        // VALIDACIÓN DE ROL: Verificar que el rol del usuario coincida con el seleccionado
        const userRole = usuario?.rol?.toLowerCase();
        console.log('Rol del usuario en backend:', userRole);

        // Obtener los roles válidos para la opción seleccionada
        const validRoles = ROLE_MAPPING[selectedRole] || [selectedRole];

        // Verificar si el rol del usuario está en los roles válidos
        if (!validRoles.includes(userRole)) {
          throw new Error(`El rol ${selectedRole} no corresponde a tu cuenta. Por favor, elige el rol correcto para continuar.`);
        }

        // Si la validación pasa, guardar los tokens
        localStorage.setItem('access_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        // Guardar información del usuario
        if (usuario) {
          localStorage.setItem('user', JSON.stringify(usuario));
        }

        console.log('Login exitoso!');

        // *** CORRECCIÓN: Usar el userRole real del backend para la redirección ***
        const redirectPath = getRedirectPath(userRole); // Cambiado de selectedRole a userRole
        console.log('Redirigiendo a:', redirectPath, 'para el rol:', userRole);

        // Redirigir según el rol REAL del usuario
        navigate(redirectPath);
      } else {
        throw new Error('No se recibió el token de acceso');
      }

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