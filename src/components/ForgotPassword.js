import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000';

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

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones del frontend
      if (!email.trim()) {
        throw new Error('Por favor, ingresa tu correo electrónico');
      }

      if (!newPassword.trim()) {
        throw new Error('Por favor, ingresa una nueva contraseña');
      }

      if (!confirmPassword.trim()) {
        throw new Error('Por favor, confirma tu contraseña');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Enviar con los nombres de campos que espera el backend
      const payload = { 
        correo: email.trim(), 
        contraseña: newPassword.trim()
      };
      
      console.log('Enviando al backend:', payload);
      console.log('Email:', payload.correo);
      console.log('Contraseña:', payload.contraseña);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/recuperar-contrasena`, {
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
        console.error('Status de respuesta:', response.status);
        console.error('URL llamada:', response.url);
        
        if (response.status === 404) {
          throw new Error('El endpoint de recuperación de contraseña no está disponible. Verifica la configuración del servidor.');
        }
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        // Manejo mejorado de errores
        let errorMessage = 'Error al recuperar la contraseña';

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
          
          Object.entries(data).forEach(([key, value]) => {
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
        if (response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (response.status === 400) {
          errorMessage = errorMessage || 'Datos inválidos. Verifica la información ingresada';
        } else if (response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor, intenta más tarde';
        }

        throw new Error(errorMessage);
      }

      // Éxito
      setSuccess('Contraseña actualizada correctamente');
      console.log('Contraseña actualizada exitosamente');
      
      // Limpiar formulario
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
      
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return {
    // Estados
    email,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    error,
    success,
    loading,
    
    // Funciones para actualizar estados
    setEmail,
    setNewPassword,
    setConfirmPassword,
    
    // Funciones de acción
    handleResetPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleNavigateToLogin
  };
};